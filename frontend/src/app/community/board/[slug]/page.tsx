'use client';

import { useParams } from 'next/navigation';
import { useModalStore } from "@/shared/model/modalStore";
import { useCommunityStore } from "@/shared/model/communityStore";
import { useAuthStore } from "@/shared/model/authStore";
import { useToastStore } from "@/shared/model/toastStore";
import Header from "@/widgets/Header/ui/Header";
import Sidebar from "@/widgets/Sidebar/ui/Sidebar";
import PostCard from "@/entities/post/ui/PostCard";
import { useState, useEffect } from 'react';
import { getCommunityTheme } from '@/shared/lib/communityThemes';

const FIXED_CATEGORIES = ['경제', '방송', '쇼핑', '자유게시판'];


const CATEGORY_ICONS: Record<string, string> = {
  '경제':     'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  '방송':     'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  '쇼핑':     'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  '자유게시판': 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-5.5-2.2L3 19l1.2-4.5A8.012 8.012 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z',
};

type SortType = 'hot' | 'new' | 'top';

export default function CommunityPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);

  const { openCreatePost } = useModalStore();
  const { isMember, joinCommunity, incrementMember, getMemberCount, getDailyVisitors, getWeeklyVisitors, recordVisit, posts: allPosts, fetchPosts, isLoading } = useCommunityStore();

  const [sort, setSort] = useState<SortType>('hot');

  useEffect(() => {
    recordVisit(slug);
    if (FIXED_CATEGORIES.includes(slug)) return;
    const stored: string[] = JSON.parse(localStorage.getItem('recentCommunities') || '[]');
    const updated = [slug, ...stored.filter(s => s !== slug)].slice(0, 5);
    localStorage.setItem('recentCommunities', JSON.stringify(updated));
  }, [slug, recordVisit]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const { isAuthenticated } = useAuthStore();
  const toastSuccess = useToastStore((state) => state.success);
  const toastError = useToastStore((state) => state.error);
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);

  const theme = getCommunityTheme(slug);
  const gradient = theme.gradient;
  const iconPath = CATEGORY_ICONS[slug];

  const filteredPosts = allPosts.filter(p => p.community === slug);
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sort === 'new') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return (b.upvotes || 0) - (a.upvotes || 0);
  });

  const mappedPosts = sortedPosts.map(p => ({
    id: p.id,
    subreddit: p.community,
    author: p.author,
    timeAgo: new Date(p.createdAt).toLocaleString('ko-KR'),
    title: p.title,
    content: p.content,
    upvotes: p.upvotes,
    comments: p.commentCount,
  }));

  const handleJoinClick = () => {
    if (!isAuthenticated) { toastError('로그인이 필요합니다.'); return; }
    setShowJoinConfirm(true);
  };

  const handleJoinConfirm = () => {
    joinCommunity(slug);
    incrementMember(slug);
    setShowJoinConfirm(false);
    toastSuccess(`'${slug}' 커뮤니티에 가입했습니다.`);
  };

  const joined = isMember(slug);
  const memberCount = getMemberCount(slug);
  const dailyVisitors = getDailyVisitors(slug);
  const weeklyVisitors = getWeeklyVisitors(slug);

  const SORT_TABS: { key: SortType; label: string; icon: string }[] = [
    { key: 'hot', label: '인기', icon: '🔥' },
    { key: 'new', label: '최신', icon: '✨' },
    { key: 'top', label: '탑', icon: '🏆' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-[#0F1117] min-h-screen">
      <Header />

      <div className="flex justify-center">
        <div className="flex w-full max-w-[1200px] gap-6">
          <Sidebar />

          <div className="flex-1 min-w-0 py-5">

            {/* Community Header */}
            <div className="mb-5 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#2D2F3A]">
              {/* Gradient Banner */}
              <div className={`h-[140px] bg-gradient-to-r ${gradient} relative`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                />
              </div>

              {/* Header Info Bar */}
              <div className="bg-white dark:bg-[#1E2028] px-5 pb-4">
                <div className="flex items-end justify-between">
                  <div className="flex items-end gap-4">
                    {/* Icon overlapping banner */}
                    <div className="relative -top-5 shrink-0">
                      <div className={`h-[72px] w-[72px] rounded-2xl bg-gradient-to-br ${gradient} shadow-lg flex items-center justify-center border-4 border-white dark:border-[#1E2028]`}>
                        {iconPath ? (
                          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
                          </svg>
                        ) : (
                          <span className="text-white text-2xl font-bold">{slug.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                    <div className="pb-1 -mt-1">
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{slug}</h1>
                      <div className="flex items-center gap-3 mt-0.5 text-[12px] text-gray-500 dark:text-gray-400">
                        <span><strong className="text-gray-700 dark:text-gray-300">{memberCount}</strong> 멤버</span>
                        <span>·</span>
                        <span><strong className="text-gray-700 dark:text-gray-300">{dailyVisitors}</strong> 오늘 방문</span>
                        <span>·</span>
                        <span><strong className="text-gray-700 dark:text-gray-300">{weeklyVisitors}</strong> 주간 방문</span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 pb-2">
                    <button
                      onClick={openCreatePost}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2D2F3A] hover:bg-gray-200 dark:hover:bg-[#3D3F4A] rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                      </svg>
                      글쓰기
                    </button>
                    {!FIXED_CATEGORIES.includes(slug) && (
                      <button
                        onClick={handleJoinClick}
                        disabled={joined}
                        className={`px-5 py-2 text-sm font-bold rounded-xl transition-colors ${
                          joined
                            ? 'bg-gray-100 dark:bg-[#2D2F3A] text-gray-500 dark:text-gray-400 cursor-default border border-gray-200 dark:border-[#3D3F4A]'
                            : `${theme.btnBg} ${theme.btnHover} text-white shadow-sm`
                        }`}
                      >
                        {joined ? '✓ 가입됨' : '가입하기'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Feed Layout */}
            <div className="flex gap-5">
              <div className="flex-1 min-w-0">
                {/* Sort tabs */}
                <div className="flex items-center gap-1 bg-white dark:bg-[#1E2028] px-3 py-2 mb-4 rounded-2xl border border-gray-100 dark:border-[#2D2F3A]">
                  {SORT_TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setSort(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${
                        sort === tab.key
                          ? `${theme.lightBg} ${theme.lightText}`
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2D2F3A] hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Posts */}
                {isLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="bg-white dark:bg-[#1E2028] rounded-2xl p-4 border border-gray-100 dark:border-[#2D2F3A] animate-pulse">
                        <div className="flex gap-2 mb-3">
                          <div className="h-5 w-16 bg-gray-100 dark:bg-[#2D2F3A] rounded-full" />
                          <div className="h-5 w-24 bg-gray-100 dark:bg-[#2D2F3A] rounded-full" />
                        </div>
                        <div className="h-5 w-3/4 bg-gray-100 dark:bg-[#2D2F3A] rounded mb-2" />
                        <div className="h-4 w-full bg-gray-100 dark:bg-[#2D2F3A] rounded" />
                      </div>
                    ))}
                  </div>
                ) : mappedPosts.length > 0 ? (
                  mappedPosts.map(post => <PostCard key={post.id} {...post} />)
                ) : (
                  <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-100 dark:border-[#2D2F3A] p-12 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">아직 게시글이 없습니다</p>
                    <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1">첫 번째 글을 작성해보세요!</p>
                    <button
                      onClick={openCreatePost}
                      className={`mt-4 px-5 py-2 ${theme.btnBg} ${theme.btnHover} text-white text-sm font-semibold rounded-xl transition-colors`}
                    >
                      글 작성하기
                    </button>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="hidden lg:block w-[280px] shrink-0">
                <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-100 dark:border-[#2D2F3A] overflow-hidden sticky top-[65px]">
                  <div className={`bg-gradient-to-r ${gradient} px-4 py-3`}>
                    <h2 className="text-white font-bold text-sm">커뮤니티 정보</h2>
                  </div>
                  <div className="p-4">
                    <p className="text-[13px] text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      {slug} 관련 소식과 토론을 자유롭게 나눠보세요.
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-[#2D2F3A]">
                      <div className="text-center">
                        <div className="text-[15px] font-bold text-gray-900 dark:text-white">{memberCount}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">멤버</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[15px] font-bold text-gray-900 dark:text-white">{dailyVisitors}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">오늘</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[15px] font-bold text-gray-900 dark:text-white">{weeklyVisitors}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">이번 주</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">커뮤니티 규칙</h3>
                      <ul className="space-y-1.5">
                        {['서로 존중하기', '관련 주제만 게시', '허위 정보 금지'].map((rule, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600 dark:text-gray-400">
                            <span className={`${theme.ruleNumberColor} font-bold mt-0.5`}>{i + 1}.</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={openCreatePost}
                      className={`w-full ${theme.btnBg} ${theme.btnHover} text-white font-bold py-2.5 rounded-xl text-sm mb-2 transition-colors`}
                    >
                      + 새 글 작성
                    </button>
                    {!FIXED_CATEGORIES.includes(slug) && !joined && (
                      <button
                        onClick={handleJoinClick}
                        className="w-full bg-gray-100 dark:bg-[#2D2F3A] hover:bg-gray-200 dark:hover:bg-[#3D3F4A] text-gray-700 dark:text-gray-300 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                      >
                        가입하기
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 가입 확인 모달 */}
      {showJoinConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowJoinConfirm(false)}
        >
          <div
            className="bg-white dark:bg-[#1E2028] rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 dark:border-[#2D2F3A]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">커뮤니티 가입</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              <span className="font-semibold text-gray-800 dark:text-gray-200">{slug}</span> 커뮤니티에 가입하시겠습니까?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowJoinConfirm(false)}
                className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2D2F3A] rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleJoinConfirm}
                className={`px-5 py-2 text-sm font-bold ${theme.btnBg} ${theme.btnHover} text-white rounded-xl transition-colors`}
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
