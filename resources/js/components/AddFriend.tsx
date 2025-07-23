import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
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

export default  function AddFriendComponent({ searchQuery ,logid}: { searchQuery: string , logid:number}) {
  const [results, setResults] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState<number | null>(null);

  useEffect(() => {
    if (!searchQuery ) {
      setResults([]);
      return;
    }

    setLoading(false);

    router.get(
      route('friends.search'),
      { query: searchQuery },
      {
        preserveState: true,
        preserveScroll: true,
        onSuccess: (page: any) => {
          setResults((page.props?.results || []) as UserType[]);
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        }
      }
    );
  }, [searchQuery, requestSent]);

  const handleSendRequest = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    router.post(
      route('friends.store'),
      { user_id: userId },
      {
        onSuccess: () => {
          setRequestSent(userId); // trigger re-fetch
        },
      }
    );
  };

  const handleFriendPage = (e: React.MouseEvent, userId: number,username: string) => {
    e.stopPropagation();

    router.get(
      route('friends.show',logid),
      { user_id: userId,
        name : username,
        logid: logid
       }
    );
  };

  return (
    <div className="space-y-3 mt-4">
      {loading && <p className="text-gray-400">Searching...</p>}
      {!loading && results.length === 0 && <p className="text-gray-400">No users found.</p>}
      {!loading &&
        results.map((user) => (
          <div
            onClick={(e) => handleFriendPage(e,user.id,user.name)}
            key={user.id}
            className="flex justify-between items-center p-3 rounded hover:bg-gray-700 transition cursor-pointer"
          >
            <span className="text-white">{user.name}</span>
            <button
              onClick={(e) => handleSendRequest(e,user.id)}
              
              className="text-blue-700 hover:text-white-600 hover:bg-blue-300 px-2 py-1 rounded cursor-pointer"
            >
              Send Request
            </button>
          </div>
        ))}
    </div>
  );
}
