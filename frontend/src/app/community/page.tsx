'use client';

import Header from "@/widgets/Header/ui/Header";
import Sidebar from "@/widgets/Sidebar/ui/Sidebar";
import PostCard from "@/entities/post/ui/PostCard";
import Link from "next/link";
import { useState, useEffect } from 'react';

import CommunitySearch from "@/features/search/ui/CommunitySearch";
import { useCommunityStore } from "@/shared/model/communityStore";
import { useAuthStore } from "@/shared/model/authStore";
import { useToastStore } from "@/shared/model/toastStore";

const SORT_OPTIONS = [
  { key: 'hot', label: '인기', icon: 'M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z' },
  { key: 'best', label: '베스트', icon: 'M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { key: 'new', label: '최신', icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' },
  { key: 'top', label: '상위', icon: 'M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 00-1-1H3z' },
] as const;

type SortKey = typeof SORT_OPTIONS[number]['key'];

export default function CommunityPage() {
  const { getSortedPosts, setFilter, selectedFilter, fetchPosts, isLoading, isMember, joinCommunity } = useCommunityStore();
  const sortedPosts = getSortedPosts();
  const { isAuthenticated } = useAuthStore();
  const toastSuccess = useToastStore((state) => state.success);
  const toastError = useToastStore((state) => state.error);

  const [searchQuery, setSearchQuery] = useState('');
  const [joinConfirmTarget, setJoinConfirmTarget] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  const isSearching = searchQuery.trim().length > 0;

  const displayPosts = isSearching
    ? sortedPosts.filter((post) => {
        const q = searchQuery.toLowerCase();
        return (
          post.title.toLowerCase().includes(q) ||
          post.content.toLowerCase().includes(q) ||
          post.community.toLowerCase().includes(q)
        );
      })
    : sortedPosts;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterClick = (key: SortKey) => {
    setFilter(key);
  };

  const handleJoinClick = (slug: string) => {
    if (!isAuthenticated) {
      toastError('로그인이 필요합니다.');
      return;
    }
    setJoinConfirmTarget(slug);
  };

  const handleJoinConfirm = () => {
    if (!joinConfirmTarget) return;
    joinCommunity(joinConfirmTarget);
    toastSuccess(`'${joinConfirmTarget}' 커뮤니티에 가입했습니다.`);
    setJoinConfirmTarget(null);
  };

  const POPULAR_COMMUNITIES = [
      { rank: 1, name: '경제', slug: '경제', members: '12만', color: 'bg-blue-500' },
      { rank: 2, name: '방송', slug: '방송', members: '8.5만', color: 'bg-red-500' },
      { rank: 3, name: '쇼핑', slug: '쇼핑', members: '6만', color: 'bg-orange-500' },
      { rank: 4, name: '자유게시판', slug: '자유게시판', members: '4.5만', color: 'bg-green-500' },
      { rank: 5, name: 'KoreaIT', slug: 'KoreaIT', members: '3만', color: 'bg-indigo-500' },
  ];

  return (
    <div className="bg-[#F6F7F8] dark:bg-[#030303] min-h-screen">
      <Header />

      <div className="flex justify-center">
        <div className="flex w-full max-w-[1200px] gap-6">

             {/* Left Sidebar */}
             <Sidebar />

             {/* Main Content Area */}
             <div className="flex-1 py-5 flex gap-5">
                 {/* Feed Container */}
                 <div className="flex-1 max-w-[640px]">
                    {/* Search */}
                    <CommunitySearch onSearch={handleSearch} />

                    {/* Sort Filter */}
                    {!isSearching && (
                        <div className="flex items-center gap-1 bg-white dark:bg-[#1A1A1B] p-2.5 mb-3 rounded-xl border border-gray-200 dark:border-[#343536]">
                            {SORT_OPTIONS.map(option => (
                              <button
                                key={option.key}
                                onClick={() => handleFilterClick(option.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[13px] transition-colors ${
                                  selectedFilter === option.key
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272729] hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                              >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d={option.icon} clipRule="evenodd"/>
                                </svg>
                                {option.label}
                              </button>
                            ))}
                        </div>
                    )}

                    {/* Posts List */}
                    {isLoading ? (
                        <div className="text-center py-14 bg-white dark:bg-[#1A1A1B] rounded-xl border border-gray-200 dark:border-[#343536]">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">게시글을 불러오는 중...</p>
                        </div>
                    ) : isSearching && displayPosts.length === 0 ? (
                        <div className="text-center py-14 bg-white dark:bg-[#1A1A1B] rounded-xl border border-gray-200 dark:border-[#343536]">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="text-gray-500 font-semibold">검색 결과가 없습니다.</p>
                            <p className="text-gray-400 text-sm mt-1">다른 키워드로 검색해보세요.</p>
                        </div>
                    ) : (
                        displayPosts.map(post => (
                          <PostCard
                            key={post.id}
                            id={post.id}
                            subreddit={post.community}
                            author={post.author}
                            timeAgo={new Date(post.createdAt).toLocaleDateString('ko-KR')}
                            title={post.title}
                            content={post.content}
                            upvotes={post.upvotes}
                            comments={post.commentCount}
                          />
                        ))
                    )}
                 </div>

                 {/* Right Sidebar - Popular Communities */}
                 <div className="hidden lg:block w-[300px] shrink-0">
                    <div className="bg-white dark:bg-[#1A1A1B] rounded-xl border border-gray-200 dark:border-[#343536] sticky top-[65px] overflow-hidden">
                        <div className="h-[72px] bg-gradient-to-r from-blue-600 to-purple-600 relative flex items-end p-4">
                             <h2 className="text-white font-bold text-base drop-shadow">인기 커뮤니티</h2>
                        </div>
                        <div className="p-4">
                             <ul className="space-y-3">
                                 {POPULAR_COMMUNITIES.map((comm) => (
                                     <li key={comm.rank} className="flex items-center justify-between">
                                         <div className="flex items-center gap-3 overflow-hidden">
                                             <span className="text-sm font-bold text-gray-400 w-4 text-center shrink-0">{comm.rank}</span>
                                             <div className={`w-7 h-7 rounded-full ${comm.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                               {comm.name[0]}
                                             </div>
                                             <div className="flex flex-col min-w-0">
                                                 <Link href={`/community/board/${comm.slug}`} className="font-bold text-sm hover:underline truncate text-gray-800 dark:text-gray-200">{comm.name}</Link>
                                                 <span className="text-xs text-gray-400">{comm.members}명</span>
                                             </div>
                                         </div>
                                         <button
                                           onClick={() => !isMember(comm.slug) && handleJoinClick(comm.slug)}
                                           disabled={isMember(comm.slug)}
                                           className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors shrink-0 ${
                                             isMember(comm.slug)
                                             ? 'border-blue-500 text-blue-500 cursor-default'
                                             : 'bg-blue-600 text-white border-transparent hover:bg-blue-700'
                                           }`}
                                         >
                                             {isMember(comm.slug) ? '가입됨' : '가입'}
                                         </button>
                                     </li>
                                 ))}
                             </ul>
                             <button className="w-full mt-5 py-2 bg-gray-50 dark:bg-[#272729] rounded-lg text-sm font-bold text-blue-600 hover:bg-gray-100 dark:hover:bg-[#343536] transition-colors">
                                 전체 커뮤니티 보기
                             </button>
                        </div>

                        {/* Footer Links */}
                        <div className="border-t border-gray-100 dark:border-[#343536] p-4">
                             <div className="flex flex-wrap gap-x-3 gap-y-2 text-[11px] text-gray-400">
                                 <a href="#" className="hover:underline">이용약관</a>
                                 <a href="#" className="hover:underline">개인정보처리방침</a>
                                 <a href="#" className="hover:underline">운영 정책</a>
                                 <a href="#" className="hover:underline">운영자 가이드</a>
                             </div>
                             <div className="mt-3 text-[11px] text-gray-400">
                                 AnalysisTrend © 2026. All rights reserved.
                             </div>
                        </div>
                    </div>
                 </div>

             </div>
        </div>
      </div>

      {/* 커뮤니티 가입 확인 모달 */}
      {joinConfirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setJoinConfirmTarget(null)}
        >
          <div
            className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">커뮤니티 가입</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              <span className="font-semibold text-gray-800 dark:text-gray-200">{joinConfirmTarget}</span> 커뮤니티에 가입하시겠습니까?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setJoinConfirmTarget(null)}
                className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleJoinConfirm}
                className="px-5 py-2 text-sm font-bold bg-[#0079D3] hover:bg-[#006CBB] text-white rounded-xl transition-colors"
              >
                가입하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
