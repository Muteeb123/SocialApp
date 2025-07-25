import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { Plus, Users, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { useInitials } from '@/hooks/use-initials';
type UserType = {
    id: number;
    name: string;
};

type Group = {
    id: number;
    name: string;
    creator: UserType;
    is_member: boolean;
};

type PageProps = {
    groups: Group[];
    auth: {
        user: UserType;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Groups', href: '/groups' },
];

export default function Groups() {
    const { groups, auth, flash = {}, errors = {} } = usePage<PageProps>().props;
    const currentUserId = auth.user.id;

    const [activeTab, setActiveTab] = useState<'join' | 'my' | 'create'>('join');
    const [searchQuery, setSearchQuery] = useState('');
    const [groupName, setGroupName] = useState('');
    const getInitials = useInitials()
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
        if (errors) Object.values(errors).forEach(msg => toast.error(msg));
    }, [flash, errors]);

    const matchesSearch = (name: string) =>
        name.toLowerCase().includes(searchQuery.toLowerCase());

    const myGroups = groups.filter(g => g.creator.id === currentUserId || g.is_member);
    const joinableGroups = groups.filter(g => !g.is_member && g.creator.id !== currentUserId);

    const filteredMyGroups = myGroups.filter(g => matchesSearch(g.name));
    const filteredJoinableGroups = joinableGroups.filter(g => matchesSearch(g.name));

    const handleJoinGroup = (groupId: number) => {
        router.post(route('groups.join', groupId));
    };

    const handleCreateGroup = () => {
        if (groupName.trim() !== '') {
            router.post(route('groups.store'), { name: groupName });
            setGroupName('');
        } else {
            toast.error('Group name is required');
        }
    };
    const handleLeaveGroup = (groupId: number) => {
    router.post(route('groups.leave', groupId));
};

    const handleDeleteGroup = (groupId: number) => {
        if (confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
            router.delete(route('groups.destroy', groupId));
        }
    };
    const renderGroupList = (list: Group[], actionButton?: (group: Group) => React.ReactNode) => (
        <ul className="space-y-3 mt-4">
            {list.map(group => (
                <li
                    key={group.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-transparent hover:bg-gray-700 transition"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase">
                            {getInitials(group.name)}
                        </div>
                        <div>
                            <div className="text-white font-semibold text-base">{group.name}</div>
                            <div className="text-xs text-gray-400">
                                Created by: {group.creator.name.split(' ')[0]}
                            </div>
                        </div>
                    </div>
                    {actionButton && actionButton(group)}
                </li>
            ))}
        </ul>
    );


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-6 text-white">
                {/* Tabs */}
                <div className="flex space-x-4 border-b pb-2 mb-4">
                    {[
                        { key: 'join', label: 'Join', icon: <UserPlus size={18} /> },
                        { key: 'my', label: 'My Groups', icon: <Users size={18} /> },
                        { key: 'create', label: 'Create', icon: <Plus size={18} /> },
                    ].map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as any)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded transition ${activeTab === key
                                ? 'bg-gray-600 text-white'
                                : 'hover:bg-gray-800 text-gray-300 cursor-pointer'
                                }`}
                        >
                            {icon}
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                {(activeTab === 'join' || activeTab === 'my') && (
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400"
                        />
                    </div>
                )}

                {/* Joinable Groups */}
                {activeTab === 'join' &&
                    renderGroupList(filteredJoinableGroups, (group) => (
                        <button
                            onClick={() => handleJoinGroup(group.id)}
                            className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-700 transition"
                        >
                            Join
                        </button>
                    ))}

                {/* My Groups */}
                {activeTab === 'my' &&
                    renderGroupList(filteredMyGroups, (group) => (
                        <div className="flex gap-2">
                            {/* Show Leave button if user is a member */}
                            {group.is_member && (
                                <button
                                   onClick={() => handleLeaveGroup(group.id)}
                                    className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700 transition"
                                >
                                    Leave
                                </button>
                            )}
                            {/* Show Delete button if user is the creator */}
                            {group.creator.id === currentUserId && (
                                <button
                                    onClick={() => handleDeleteGroup(group.id)}
                                    className="px-3 py-1 text-sm rounded bg-yellow-600 hover:bg-yellow-700 transition"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}

                {/* Create Group */}
                {activeTab === 'create' && (
                    <div className="space-y-4 mt-4">
                        <input
                            type="text"
                            placeholder="Enter group name..."
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400"
                        />
                        <button
                            onClick={handleCreateGroup}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
                        >
                            Create Group
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
