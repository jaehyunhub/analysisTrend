'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function JoinedCommunityList() {
  const [joinedCommunities, setJoinedCommunities] = useState([
    { id: 1, name: 'r/SyukaUniverse', members: '1.2m', icon: 'bg-blue-500' },
    { id: 2, name: 'r/KoreaIT', members: '850k', icon: 'bg-green-500' },
    { id: 3, name: 'r/K-Pop', members: '450k', icon: 'bg-pink-500' }
  ]);

  const handleLeave = (id: number) => {
    if (confirm('Are you sure you want to leave this community?')) {
        setJoinedCommunities(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="bg-white dark:bg-[#1A1A1B] rounded-lg shadow-sm border border-gray-200 dark:border-[#343536] p-6">
        <h2 className="text-xl font-bold mb-6 text-[#1C1C1C] dark:text-[#D7DADC]">My Communities</h2>
        
        {joinedCommunities.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
                You haven't joined any communities yet.
            </div>
        ) : (
            <div className="space-y-4">
                {joinedCommunities.map(community => (
                    <div key={community.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-[#343536] rounded-lg hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors">
                        <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 ${community.icon} rounded-full flex items-center justify-center text-white font-bold`}>
                                 {community.name.charAt(2).toUpperCase()}
                             </div>
                             <div>
                                 <Link href={`/community/board/${community.name.replace('r/','')}`} className="font-bold text-[#1C1C1C] dark:text-[#D7DADC] hover:underline">
                                     {community.name}
                                 </Link>
                                 <div className="text-xs text-gray-500">{community.members} members</div>
                             </div>
                        </div>
                        <button 
                            onClick={() => handleLeave(community.id)}
                            className="px-4 py-2 text-red-500 border border-red-500 rounded-full text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            Leave
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}
