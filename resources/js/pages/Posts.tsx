import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useInitials } from '@/hooks/use-initials';
import { usePage } from '@inertiajs/react';
import {
    ThumbsUp,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    X,
    Heart,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import PostSkeleton from '@/components/PostSkeleton';
import CommentController from '@/components/CommentComponent';
import { useAuth } from './auth/useAuth';
import LikeController from '@/components/LikeComponent';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hello', href: '/home' },
];

type User = { id: number; name: string };
type Comment = {
    id: number;
    user: User;
    text: string;
    created_at: string;
};
type Post = {
    id: number;
    user_id: number;
    caption: string;
    no_of_likes: number;
    no_of_comments: number;
    img_url: string;
    user: User;
    isliked?: boolean;
};

export default function Posts() {
    const getInitials = useInitials();
    const [posts, setPosts] = useState<Post[]>([]);
    const [seenIds, setSeenIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const loadTriggerRef = useRef<HTMLDivElement | null>(null);
    const lastPostRef = useRef<HTMLDivElement | null>(null);
    const [currentPostIndex, setCurrentPostIndex] = useState<number>(-1);
    const [expandedCaptions, setExpandedCaptions] = useState<Record<number, boolean>>({});
    const [activePanel, setActivePanel] = useState<'comments' | 'likes' | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const index = getCurrentPostIndex();
            setCurrentPostIndex((prev) => prev !== index ? index : prev);
        };

        const container = containerRef.current;
        if (container) container.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, [posts]);

    const formatNumber = (num: number): string =>
        num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num.toString();

    const groupId = usePage().props.groupId || null;
    const user = useAuth();
    const fetchPost = async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        try {
            const query = new URLSearchParams();
            seenIds.forEach((id) => query.append('seen_ids[]', id.toString()));
            if (groupId) query.append('group_id', groupId.toString());

            const response = await fetch(`/how?${query.toString()}`, {
                headers: { Accept: 'application/json' },
            });
            const data = await response.json();

            if (data.posts?.length > 0) {
                setPosts((prev) => {
                    const all = [...prev, ...data.posts];
                    const uniqueMap = new Map<number, Post>();
                    all.forEach((p) => uniqueMap.set(p.id, p));
                    return Array.from(uniqueMap.values());
                });
                setSeenIds(data.seen_ids);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Failed to fetch post:', err);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchPost(); }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMore && !isLoading &&
                    containerRef.current &&
                    containerRef.current.scrollTop + containerRef.current.clientHeight >=
                    containerRef.current.scrollHeight - 10) {
                    fetchPost();
                }
            },
            { threshold: 1 }
        );
        const el = loadTriggerRef.current;
        if (el) observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, isLoading, seenIds]);

    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = originalStyle; };
    }, []);

    const getCurrentPostIndex = () => {
        if (!containerRef.current || posts.length === 0) return -1;
        const container = containerRef.current;
        const containerTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const containerCenter = containerTop + containerHeight / 2;

        const postElements = container.querySelectorAll('[data-post]');
        for (let i = 0; i < postElements.length; i++) {
            const element = postElements[i] as HTMLElement;
            const elementTop = element.offsetTop;
            const elementBottom = elementTop + element.clientHeight;
            if (containerCenter >= elementTop && containerCenter < elementBottom) return i;
        }
        return postElements.length - 1;
    };

    const scrollToNext = async () => {

        if (!containerRef.current || isLoading || posts.length === 0) return;
        const currentIndex = getCurrentPostIndex();
        const isAtLastPost = currentIndex === posts.length - 1;
        const isAtSecondLastPost = currentIndex === posts.length - 2;

        if (!hasMore) return;
        if ((isAtSecondLastPost || isAtLastPost) && hasMore && !isLoading) {
            const currentIndexBeforeFetch = currentIndex;
            await fetchPost();
            setTimeout(() => {
                const postElements = containerRef.current?.querySelectorAll('[data-post]');
                const targetIndex = currentIndexBeforeFetch + 1;
                if (postElements && targetIndex < postElements.length) {
                    const targetPost = postElements[targetIndex] as HTMLElement;
                    targetPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } else {
            if (!containerRef.current) return;
            const postElements = containerRef.current.querySelectorAll('[data-post]');
            const nextIndex = Math.min(currentIndex + 1, postElements.length - 1);
            if (nextIndex < postElements.length) {
                const nextPost = postElements[nextIndex] as HTMLElement;
                setTimeout(() => {
                    nextPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100)
            }
        }
    };

    const scrollToPrev = () => {
        if (!containerRef.current || isLoading || posts.length === 0) return;
        const currentIndex = getCurrentPostIndex();
        const prevIndex = Math.max(currentIndex - 1, 0);
        const postElements = containerRef.current.querySelectorAll('[data-post]');
        if (prevIndex >= 0 && prevIndex < postElements.length) {
            const prevPost = postElements[prevIndex] as HTMLElement;
            prevPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleLike = async (postId: number) => {
        setPosts(posts.map(post => post.id === postId ? {
            ...post,
            no_of_likes: post.isliked ? post.no_of_likes - 1 : post.no_of_likes + 1,
            isliked: !post.isliked
        } : post));

        if (posts[currentPostIndex].isliked){
        await    router.delete(route('posts.destroy', postId), {
    preserveState: true,
    preserveScroll: true,
});
        }
        else {
          await   router.get(route('posts.edit', postId), {}, {
    preserveState: true,
    preserveScroll: true,
});

        }
        // try {
        //     await fetch(`/}/like`, {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'X-CSRF-TOKEN': String(usePage().props.csrf_token)
        //         }
        //     });
        // } catch (error) {
        //     console.error('Error liking post:', error);
        // }
    };

    const toggleCaption = (postId: number) => {
        setExpandedCaptions(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const handleFriendPage = (e: React.MouseEvent) => {
         e.stopPropagation();

         router.get(
           route('friends.show', posts[currentPostIndex].user_id),
           { user_id: posts[currentPostIndex].user_id,
             name : posts[currentPostIndex].user.name,
             logid : user?.id,
            }
         );
       };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Posts" />
            <div className="relative flex justify-center items-left h-screen w-full bg-black px-5 py-5">
                <div
                    ref={containerRef}
                    className="flex-1 max-w-md h-full overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar"
                >
                    {posts.length === 0 && !isLoading && (
                        <div className="h-full w-full flex items-center justify-center text-white">
                            No posts available
                        </div>
                    )}

                    {posts.map((post, index) => (
                        <div
                            data-post
                            key={post.id}
                            ref={index === posts.length - 1 ? lastPostRef : null}
                            className="snap-start h-full w-full relative px-2 py-2 rounded-[20px]"
                        >
                            <div className="absolute inset-0 rounded">
                                <img
                                    loading="lazy"
                                    src={`/storage/${post.img_url}`}
                                    alt={post.caption}
                                    className="w-full h-full object-cover rounded-[20px] px-2 py-3"
                                />
                            </div>

                            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                                <div className="flex items-center gap-3 px-2 py-3 hover:cursor-pointer"
                                
                                    onClick={(e)=>{
                                        handleFriendPage(e)
                                    }}
                                >
                                    <Avatar className="h-10 w-10 border border-white">
                                        <AvatarFallback className="bg-neutral-700 text-white">
                                            {getInitials(post.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="font-bold text-white">{post.user.name}</p>
                                </div>
                            </div>

                            <div className="absolute right-4 bottom-1/3 flex flex-col items-center gap-6">
                                <div
                                    className="flex flex-col items-center"
                                   
                                >
                                    <button className="p-2 bg-black/30 rounded-full hover:cursor-pointer"
                                         onClick={() => handleLike(post.id)}
                                    >
                                        {post.isliked ? (
                                            <Heart size={24} className="text-red-500 fill-red-500" />
                                        
                                        
                                        ) : (
                                            <ThumbsUp size={24} className="text-white" />
                                        )}
                                    </button>
                                    <span className="text-white text-xs font-bold mt-1 hover:cursor-pointer hover:underline"
                                        onClick={()=>{
                                          setActivePanel('likes')
                                        }}
                                        >
                                        {formatNumber(post.no_of_likes)}
                                    </span>
                                    
                                </div>

                                <div
                                    className="flex flex-col items-center"
                                    onClick={() => setActivePanel('comments')}
                                >
                                    <button className="p-2 bg-black/30 rounded-full cursor-pointer">
                                        <MessageCircle size={24} className="text-white" />
                                    </button>
                                    <span className="text-white text-xs font-bold mt-1 cursor-pointer hover:underline">
                                        {formatNumber(post.no_of_comments)}
                                    </span>
                                </div>
{/* 
                                <div className="rounded-full overflow-hidden border-2 border-white cursor-pointer">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-neutral-700 text-white">
                                            {getInitials(post.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div> */}
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-white font-bold text-sm">
                                        @{post.user.name.toLowerCase().replace(/\s+/g, '')}
                                    </span>
                                </div>
                                <div className="relative">
                                    <p className={`text-white text-sm mb-2 ${expandedCaptions[post.id] ? '' : 'line-clamp-2'}`}>
                                        {post.caption}
                                    </p>
                                    {post.caption.length > 100 && (
                                        <button
                                            onClick={() => toggleCaption(post.id)}
                                            className="text-white text-xs font-semibold mt-1"
                                        >
                                            {expandedCaptions[post.id] ? 'Show less' : 'Show more'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}


                    <div ref={loadTriggerRef} className="h-2 bg-transparent" />
                    {isLoading && (
                        <div className="snap-start h-full w-full flex items-center justify-center">
                            <PostSkeleton />
                        </div>
                    )}
                </div>

              {(activePanel === 'comments' || activePanel === 'likes') && (
    <div
        className={`right-0 top-0 h-full z-40 transition-all duration-500 ease-in-out transform ${
            activePanel ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[30px] pointer-events-none'
        }`}
    >
        <div className="w-[480px] h-full bg-zinc-900 shadow-xl rounded-l-xl">
            {activePanel === 'comments' ? (
                <CommentController
                    post={posts[currentPostIndex]}
                    onClick={() => setActivePanel(null)}
                />
            ) : (
                <LikeController
                    post={posts[currentPostIndex]}
                    onClick={() => setActivePanel(null)}
                />
            )}
        </div>
    </div>
)}

              

                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-10">
                    <button
                        onClick={scrollToPrev}
                        disabled={posts.length === 0 || isLoading || getCurrentPostIndex() === 0}
                        className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-50"
                    >
                        <ChevronUp size={24} />
                    </button>
                    <button
                        onClick={scrollToNext}
                        disabled={isLoading}
                        className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 disabled:opacity-50"
                    >
                        <ChevronDown size={24} />
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}