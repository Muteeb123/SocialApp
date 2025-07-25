import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { X } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '@/pages/auth/useAuth';


type User = { id: number; name: string };
type like = {
    id: number;
    user: User;
    created_at: string;
};
type Post = {
    id: number;
    user_id: number;
    caption?: string;
    no_of_likes: number;
    no_of_comments: number;
    img_url: string;
    user: User;
    isLiked?: boolean;
};

type likeControllerProps = {
    post: Post;
    onClick: () => void;
};

const likeController = ({ post, onClick }: likeControllerProps) => {
    const [likes, setlikes] = useState<like[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useAuth();
    useEffect(() => {
        const fetchlikes = async () => {
            try {
                const response = await axios.get('/likes', {
                    params: { post_id: post.id },
                });
                console.log(response.data.likes)
                setlikes(response.data.likes);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching likes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchlikes();
        console.log(likes);
    }, [post.id]);
     const handleFriendPage = (e: React.MouseEvent, id:number,name: string ) => {
             e.stopPropagation();
            console.log(id);
             router.get(
               route('friends.show', id),
               { user_id: id,
                 name,
                 logid : user?.id,
                }
             );
           };
    return (
        <div className="flex flex-col w-full h-full bg-black text-white sm:w-[480px]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold">Likes</h2>
                <button
                    onClick={onClick}
                    className="p-2 rounded-full hover:bg-white/10 transition"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable like body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="text-center text-gray-400">Loading likes...</div>
                ) : likes.length === 0 ? (
                    <div className="text-center text-gray-400">No likes yet.</div>
                ) : (
                    likes.map((like) => (
                        <div
                            key={like.id}
                            className="flex items-start gap-3 bg-white/5 p-3 rounded-lg"


                        >
                            <Avatar className="h-10 w-10 border border-white/10">

                                <AvatarFallback className="bg-neutral-700 text-white cursor-pointer"

                                    onClick={(e) => {
                                        handleFriendPage
                                            (e,like.user.id,like.user.name)
                                    }}>
                                    {like.user.name
                                        .split(' ')
                                        .map((w) => w[0])
                                        .join('')
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <span onClick={(e) => {
                                        handleFriendPage
                                            (e,like.user.id,like.user.name)
                                    }}
                                        className="text-sm font-semibold cursor-pointer hover:underline">{like.user.name}</span>
                                    <span className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(like.created_at), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

};

export default likeController;
