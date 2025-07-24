import React, { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'react-hot-toast';
import { useAuth } from './auth/useAuth';
type Props = {
    reqid: number;
    id: number;
    name: string;
    sent: number;
    received: number;
    friends: number;
    existing: boolean;
    is_friend: boolean;
    has_received: boolean;
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase();
}

const UserProfile: React.FC<Props> = ({ reqid, id, name, sent, received, friends, existing, is_friend, has_received }) => {
    const user = useAuth();
    const page = usePage();
    const flash = page?.props?.flash as { success?: string; error?: string } | undefined;
    const errors = page.props.errors as Record<string, string>;
    const [myProfile, setmyProfile] = useState<boolean>(false);
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (errors) Object.values(errors).forEach(msg => toast.error(msg));

        if (id == user?.id) {
            setmyProfile(true)
        }

    }, [flash, errors]);


    const handleAddFriend = () => {
        router.post(
            route('friends.store'),
            { user_id: id },

        );

    };

    return (
        <>
            <Head title={`${name}'s Profile`} />
            <AppLayout>
                <div className="w-full max-w-2xl mx-auto px-4 py-6 border-b border-neutral-700">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        {/* Avatar */}
                        <Avatar className="h-24 w-24 overflow-hidden rounded-full border-2 border-white">
                            {/* AvatarImage can be added if image URL is available */}
                            <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white text-2xl">
                                {getInitials(name)}
                            </AvatarFallback>
                        </Avatar>

                        {/* Name */}
                        <h1 className="text-2xl font-bold text-white">{name}</h1>

                        {/* Stats */}
                        <div className="flex space-x-8 text-sm text-neutral-300">
                            <div><span className="font-semibold text-white">{friends}</span> Friends</div>
                            <div><span className="font-semibold text-white">{sent}</span> Sent</div>
                            <div><span className="font-semibold text-white">{received}</span> Received</div>
                        </div>

                        {/* Add Friend / Pending Button */}
                        {myProfile ? (
                            <button
                                disabled
                                className="px-4 py-2 mt-2 rounded bg-indigo-600 text-white opacity-80"
                            >
                                Me
                            </button>
                        ) : is_friend ? (
                            <button
                                disabled
                                className="px-4 py-2 mt-2 rounded bg-green-600 text-white opacity-80"
                            >
                                Friend
                            </button>
                        ) : has_received ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.put(route('friends.update', reqid));
                                }}
                                className="px-4 py-2 mt-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition"
                            >
                                Accept Request
                            </button>
                        ) : existing ? (
                            <button
                                disabled
                                className="px-4 py-2 mt-2 rounded bg-gray-600 text-white opacity-60"
                            >
                                Request Pending
                            </button>
                        ) : (
                            <button
                                onClick={handleAddFriend}
                                className="px-4 py-2 mt-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                            >
                                Add Friend
                            </button>
                        )}



                    </div>
                </div>
            </AppLayout>
        </>
    );
};

export default UserProfile;
