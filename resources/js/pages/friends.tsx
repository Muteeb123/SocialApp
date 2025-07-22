import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import React from 'react';

// Friend type definition
type Friend = {
    id: number;
    sender: {
        id: number;
        name: string;
    };
    receiver: {
        id: number;
        name: string;
    };
    is_accepted: boolean;
};

type PageProps = {
    friends: Friend[];
    auth: {
        user: {
            id: number;
            name: string;
        };
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Friends',
        href: '/friends',
    },
];

export default function Friends() {
    const { friends, auth } = usePage<PageProps>().props;
    const currentUserId = auth.user.id;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Your Friends</h1>
                <ul className="list-disc pl-6 space-y-2">
                    {friends.map(friend => {
                        const friendUser =
                            friend.sender.id === currentUserId
                                ? friend.receiver
                                : friend.sender;

                        return (
                            <li key={friend.id}>
                                {friendUser.name}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </AppLayout>
    );
}
