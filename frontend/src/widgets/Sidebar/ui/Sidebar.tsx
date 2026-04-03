'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Community } from '@/shared/types/community';
import { apiGet } from '@/shared/api/client';
import { COMMUNITIES } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/model/authStore';

const FIXED_CATEGORIES = ['경제', '방송', '쇼핑', '자유게시판'];

const TOPIC_ICONS = {
  경제: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  방송: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  쇼핑: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  자유게시판: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-5.5-2.2L3 19l1.2-4.5A8.012 8.012 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z',
};

const COMMUNITY_COLORS = [
  'bg-blue-500', 'bg-red-500', 'bg-orange-500', 'bg-green-500',
  'bg-indigo-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500',
];

export default function Sidebar() {
  const [isMyCommunitiesExpanded, setIsMyCommunitiesExpanded] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [recentVisits, setRecentVisits] = useState<string[]>([]);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    apiGet<Community[]>(COMMUNITIES.LIST)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setCommunities(data);
      })
      .catch(() => {
        setCommunities([]);
      });

    const stored: string[] = JSON.parse(localStorage.getItem('recentCommunities') || '[]');
    setRecentVisits(stored);
  }, []);

  const communitiesWithColor = communities
    .filter(c => !FIXED_CATEGORIES.includes(c.name))
    .map((c, i) => ({
      name: c.name,
      slug: c.name,
      icon: c.color ?? COMMUNITY_COLORS[i % COMMUNITY_COLORS.length],
    }));

  const visibleCommunities = isMyCommunitiesExpanded
    ? communitiesWithColor
    : communitiesWithColor.slice(0, 4);

  return (
    <div className="hidden lg:block w-[240px] shrink-0 h-[calc(100vh-52px)] overflow-y-auto sticky top-[52px] py-4 pr-3 bg-white dark:bg-[#1A1A1B] border-r border-[#EDEFF1] dark:border-[#343536]">

      {/* 1. Recent */}
      {recentVisits.length > 0 && (
        <div className="pl-5 mb-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">최근 방문</p>
          <ul className="space-y-0.5">
            {recentVisits.map((name, i) => (
              <li key={name}>
                <Link href={`/community/board/${encodeURIComponent(name)}`} className="flex items-center gap-2.5 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#272729] rounded-lg cursor-pointer transition-colors">
                  <div className={`h-5 w-5 ${COMMUNITY_COLORS[i % COMMUNITY_COLORS.length]} rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0`}>
                    {name[0]}
                  </div>
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. My Communities */}
      <div className="pl-5 mb-5">
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">커뮤니티</p>
         <ul className="space-y-0.5">
           {visibleCommunities.map((comm) => (
             <li key={comm.slug}>
               <Link
                 href={`/community/board/${comm.slug}`}
                 className="flex items-center gap-2.5 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#272729] rounded-lg cursor-pointer transition-colors"
               >
                  <div className={`h-5 w-5 ${comm.icon} rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0`}>
                    {comm.name[0]}
                  </div>
                  {comm.name}
               </Link>
             </li>
           ))}
           {communities.length > 4 && (
             <li>
               <button
                 onClick={() => setIsMyCommunitiesExpanded(!isMyCommunitiesExpanded)}
                 className="flex items-center gap-2.5 p-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#272729] rounded-lg cursor-pointer w-full text-left transition-colors"
               >
                 <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMyCommunitiesExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                 </svg>
                 {isMyCommunitiesExpanded ? '접기' : '더 보기'}
               </button>
             </li>
           )}
         </ul>
      </div>

      {/* 3. Topics */}
      <div className="pl-5 mb-4">
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">토픽</p>
         <ul className="space-y-0.5">
           {(Object.keys(TOPIC_ICONS) as Array<keyof typeof TOPIC_ICONS>).map(topic => (
             <li key={topic}>
               <Link
                 href={`/community/board/${topic}`}
                 className="flex items-center gap-2.5 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#272729] rounded-lg cursor-pointer group transition-colors"
               >
                  <svg className="h-4 w-4 text-gray-400 group-hover:text-blue-500 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={TOPIC_ICONS[topic]}/>
                  </svg>
                  {topic}
               </Link>
             </li>
           ))}
         </ul>
      </div>

      {/* CTA */}
      <div className="pl-5 mx-2 mt-4 pt-4 border-t border-gray-100 dark:border-[#343536]">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 py-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.nickname?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{user.nickname}</span>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">로그인하면 커뮤니티에 참여하고 글을 쓸 수 있어요.</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
              로그인 / 가입하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
