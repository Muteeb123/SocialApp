import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useInitials } from '@/hooks/use-initials';
import {
    ThumbsUp,
    MessageCircle,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import PostSkeleton from '@/components/PostSkeleton';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Posts', href: '/posts' },
];

type User = { id: number; name: string };
type Post = {
    id: number;
    user_id: number;
    caption: string;
    no_of_likes: number;
    no_of_comments: number;
    img_url: string;
    user: User;
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

    const formatNumber = (num: number): string =>
        num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num.toString();

    const fetchPost = async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            const query = new URLSearchParams();
            seenIds.forEach((id) => query.append('seen_ids[]', id.toString()));

            const response = await fetch(`/how?${query.toString()}`, {
                headers: { Accept: 'application/json' },
            });

            const data = await response.json();

            if (data.posts && data.posts.length > 0) {
                // Deduplicate based on post.id
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

    useEffect(() => {
        fetchPost(); // initial load
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    hasMore &&
                    !isLoading &&
                    containerRef.current &&
                    containerRef.current.scrollTop + containerRef.current.clientHeight >=
                        containerRef.current.scrollHeight - 10
                ) {
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
        return () => {
            document.body.style.overflow = originalStyle;
        };
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
            
            if (containerCenter >= elementTop && containerCenter < elementBottom) {
                return i;
            }
        }
        
        return postElements.length - 1; // Default to last post if none found
    };

    const scrollToNext = async () => {
        if (!containerRef.current || isLoading || posts.length === 0) return;

        const currentIndex = getCurrentPostIndex();
        const isAtLastPost = currentIndex === posts.length - 1;
        const isAtSecondLastPost = currentIndex === posts.length - 2;
        
        // If at last post and no more posts to fetch, do nothing
        if (!hasMore) {
            return;
        }

        // If at second last post or last post, fetch more posts
        if ((isAtSecondLastPost || isAtLastPost) && hasMore && !isLoading) {
            const postsCountBeforeFetch = posts.length;
            const currentIndexBeforeFetch = currentIndex;
            
            await fetchPost();
            
            // Wait a bit for the DOM to update with new posts
            setTimeout(() => {
               
                if (true) {
                    // New posts were loaded, scroll to the next post (one position forward)
                    const postElements = containerRef.current?.querySelectorAll('[data-post]');
                    const targetIndex = currentIndexBeforeFetch + 1;
                   
                    if (postElements && targetIndex < postElements.length) {
                        const targetPost = postElements[targetIndex] as HTMLElement;
                        targetPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 100);
        } else {
            // Regular scroll to next post
            const postElements = containerRef.current.querySelectorAll('[data-post]');
            const nextIndex = Math.min(currentIndex + 1, postElements.length - 1);
            
            if (nextIndex < postElements.length) {
                const nextPost = postElements[nextIndex] as HTMLElement;
                setTimeout(()=>{

                nextPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
                },100)
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Posts" />
            <div className="relative flex justify-center items-center h-screen w-full bg-black px-5 py-5">
                <div
                    ref={containerRef}
                    className="w-full max-w-md h-full overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar"
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
                                <div className="flex items-center gap-3 px-2 py-3">
                                    <Avatar className="h-10 w-10 border border-white">
                                        <AvatarFallback className="bg-neutral-700 text-white">
                                            {getInitials(post.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="font-bold text-white">{post.user.name}</p>
                                </div>
                            </div>

                            <div className="absolute right-4 bottom-1/3 flex flex-col items-center gap-6">
                                <div className="flex flex-col items-center">
                                    <button className="p-2 bg-black/30 rounded-full">
                                        <ThumbsUp size={24} className="text-white" />
                                    </button>
                                    <span className="text-white text-xs font-bold mt-1">
                                        {formatNumber(post.no_of_likes)}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <button className="p-2 bg-black/30 rounded-full">
                                        <MessageCircle size={24} className="text-white" />
                                    </button>
                                    <span className="text-white text-xs font-bold mt-1">
                                        {formatNumber(post.no_of_comments)}
                                    </span>
                                    </div>

                                <div className="rounded-full overflow-hidden border-2 border-white">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-neutral-700 text-white">
                                            {getInitials(post.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-white font-bold text-sm">
                                        @{post.user.name.toLowerCase().replace(/\s+/g, '')}
                                    </span>
                                    
                                </div>
                                <p className="text-white text-sm mb-2">{post.caption}</p>
                            </div>
                        </div>
                    ))}

                    <div ref={loadTriggerRef} className="h-2 bg-transparent" />
                    {isLoading && (
                        <div className="snap-start h-full w-full flex items-center justify-center">
                            <PostSkeleton/>
                        </div>
                    )}
                </div>

                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-10">
                    <button
                        onClick={scrollToPrev}
                        disabled={posts.length === 0 || isLoading}
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