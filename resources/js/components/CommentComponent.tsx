import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { X, Send, Delete, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useAuth } from '@/pages/auth/useAuth';
import { router } from '@inertiajs/react';
import { useInitials } from '@/hooks/use-initials';
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
    caption?: string;
    no_of_likes: number;
    no_of_comments: number;
    img_url: string;
    user: User;
    isLiked?: boolean;
    media_type?:string;
};

type CommentControllerProps = {
    post: Post;
    onClick: () => void;
};

const CommentController = ({ post, onClick }: CommentControllerProps) => {

    const user = useAuth()
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get('/comments', {
                    params: { post_id: post.id },
                });
                setComments(response.data.comments);
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [post.id]);
    const handleFriendPage = (e: React.MouseEvent, id: number, name: string) => {
        e.stopPropagation();

        router.get(
            route('friends.show', id),
            {
                user_id: id,
                name,
                logid: user?.id,
            }
        );
    };
    const handleSendComment = async () => {
        if (!newComment.trim()) return;

        setIsSending(true);
        try {
            const response = await axios.post('/comment', {
                post_id: post.id,
                text: newComment,
            });

            setComments([response.data.comment, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            await axios.delete(`/comment/${commentId}`);
            setComments(comments.filter((c) => c.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const getInitials = useInitials();



    return (
        <div className="flex flex-col w-full h-full bg-black text-white sm:w-[480px] shadow-2xl shadow-black/50">
            {/* Header with shadow */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/10 bg-black/80 backdrop-blur-sm shadow-md">
                <h2 className="text-lg font-semibold">Comments ({comments.length})</h2>
                <button
                    onClick={onClick}
                    className="p-2 rounded-full hover:bg-white/10 transition"
                    aria-label="Close comments"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable comment body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-pulse text-gray-400">Loading comments...</div>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                        <p>No comments yet.</p>
                        <p className="text-sm mt-2">Be the first to comment!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="flex items-start gap-3 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <Avatar className="h-10 w-10 border border-white/10">
                                <AvatarFallback
                                    onClick={(e) => handleFriendPage(e, comment.user.id, comment.user.name)}
                                    className="bg-neutral-700 text-white hover:cursor-pointer"
                                >
                                    {getInitials(comment.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <span
                                        onClick={(e) => handleFriendPage(e, comment.user.id, comment.user.name)}
                                        className="text-sm font-semibold cursor-pointer hover:underline"
                                    >
                                        {comment.user.name}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">
                                            {formatDistanceToNow(new Date(comment.created_at), {
                                                addSuffix: true,
                                            })}
                                        </span>
                                        {user?.id === comment.user.id && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-xs text-red-400 hover:text-red-600 transition"
                                            >
                                                <Trash2 size={20} />

                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-300 mt-1">{comment.text}</p>
                            </div>
                        </div>
                    ))

                )}
            </div>

            {/* Comment input area */}
            <div className="sticky bottom-0 p-4 border-t border-white/10 bg-black/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/30 resize-none"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendComment();
                            }
                        }}
                    />
                    <button
                        onClick={handleSendComment}
                        disabled={!newComment.trim() || isSending}
                        className={`p-2 rounded-full ${newComment.trim() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 cursor-not-allowed'} transition-colors`}
                        aria-label="Send comment"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentController;