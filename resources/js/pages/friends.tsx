import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import { User, Inbox, Send, Trash2, Check, X, Undo, UserPlus } from 'lucide-react';
import AddFriendComponent from '@/components/AddFriend'

type UserType = {
  id: number;
  name: string;
};

type Friend = {
  id: number;
  sender: UserType;
  receiver: UserType;
  is_accepted: boolean;
};

type PageProps = {
  friends: Friend[];
  auth: {
    user: UserType;
  };
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Friends', href: '/friends' },
];



export default function Friends() {
  const page = usePage();
  const flash = page?.props?.flash as { success?: string; error?: string } | undefined;
  const { friends, auth } = usePage<PageProps>().props;
  const currentUserId = auth.user.id;
  const errors = page.props.errors as Record<string, string>;
  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent' | 'add'>('friends');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
    if (errors) Object.values(errors).forEach(msg => toast.error(msg));
  }, [flash, errors]);

  const matchesSearch = (name: string) =>
    name.toLowerCase().includes(searchQuery.toLowerCase());

  const acceptedFriends = friends.filter(friend => friend.is_accepted);
  const receivedRequests = friends.filter(
    friend => !friend.is_accepted && friend.receiver.id === currentUserId
  );
  const sentRequests = friends.filter(
    friend => !friend.is_accepted && friend.sender.id === currentUserId
  );

  const filteredAcceptedFriends = acceptedFriends.filter(friend =>
    matchesSearch(friend.sender.name) || matchesSearch(friend.receiver.name)
  );
  const filteredReceivedRequests = receivedRequests.filter(friend =>
    matchesSearch(friend.sender.name) || matchesSearch(friend.receiver.name)
  );
  const filteredSentRequests = sentRequests.filter(friend =>
    matchesSearch(friend.sender.name) || matchesSearch(friend.receiver.name)
  );

  const renderActions = (friend: Friend) => {
    const baseBtn = `flex items-center space-x-1 px-2 py-1 rounded text-sm transition`;
    if (activeTab === 'friends') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.delete(route('friends.destroy', friend), {
              data: { action: 'delete' }
            });
          }}
          className={`${baseBtn} text-red-400 hover:text-red-600 hover:bg-red-100 cursor-pointer`}
        >
          <Trash2 size={16} />
          <span >Delete</span>
        </button>
      );
    }

    if (activeTab === 'received') {
      return (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
                e.stopPropagation();
              router.put(route('friends.update', friend));
            }}
            className={`${baseBtn} text-green-400 hover:text-green-600 hover:bg-green-100 cursor-pointer`}
          >
            <Check size={16} />
            <span>Accept</span>
          </button>
          <button
            onClick={(e) => {
                e.stopPropagation();
              router.delete(route('friends.destroy', friend), {
                data: { action: 'reject' }
              });
            }}
            className={`${baseBtn} text-red-400 hover:text-red-600 hover:bg-red-100 cursor-pointer`}
          >
            <X size={16} />
            <span>Reject</span>
          </button>
        </div>
      );
    }

    if (activeTab === 'sent') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.delete(route('friends.destroy', friend), {
              data: { action: 'withdraw' }
            });
          }}
          className={`${baseBtn} text-yellow-400 hover:text-yellow-600 hover:bg-yellow-100 cursor-pointer`}
        >
          <Undo size={16} />
          <span>Withdraw</span>
        </button>
      );
    }

    return null;
  };
  const handleFriendPage = (e: React.MouseEvent, userId: number,username: string) => {
     e.stopPropagation();
     router.get(
       route('friends.show',userId),
       { user_id: userId,
         name : username,
         logid : auth.user.id,
        }
     );
   };
  const renderList = (list: Friend[]) => (
    <ul className="space-y-2 mt-4">
      {list.map(friend => {
        const user =
          friend.sender.id === currentUserId ? friend.receiver : friend.sender;

        return (
          <li
           onClick={(e) => handleFriendPage(e,user.id,user.name)}
            key={friend.id}
            className="flex justify-between items-center p-3 rounded hover:bg-gray-700 transition cursor-pointer"
          >
            <span className="text-white">{user.name}</span>
            {renderActions(friend)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="p-6 text-white">
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search friends or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b pb-2 mb-4">
          {[
            { key: 'friends', label: 'Friends', icon: <User size={18} /> },
            { key: 'received', label: 'Received', icon: <Inbox size={18} /> },
            { key: 'sent', label: 'Sent', icon: <Send size={18} /> },
            { key: 'add', label: 'Add Friend', icon: <UserPlus size={18} /> },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              className={`flex items-center space-x-2 px-4 py-2 rounded transition ${
                activeTab === key
                  ? 'bg-gray-600 text-white'
                  : 'hover:bg-gray-800 text-gray-300 cursor-pointer'
              }`}
              onClick={() => setActiveTab(key as any)}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'friends' && renderList(filteredAcceptedFriends)}
        {activeTab === 'received' && renderList(filteredReceivedRequests)}
        {activeTab === 'sent' && renderList(filteredSentRequests)}
        {activeTab === 'add' && <AddFriendComponent searchQuery={searchQuery} logid ={auth.user.id} />}
      </div>
    </AppLayout>
  );
}
