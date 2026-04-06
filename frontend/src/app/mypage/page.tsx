'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from "@/widgets/Header/ui/Header";
import { useAuthStore } from '@/shared/model/authStore';
import { useCommunityStore } from '@/shared/model/communityStore';
import { useToastStore } from '@/shared/model/toastStore';
import {
  MOCK_ORDER_STATS,
  MOCK_RECENT_ORDERS,
  MOCK_COMMUNITY_ACTIVITIES,
  MOCK_ORDERS,
} from '@/shared/mocks/mypage';
import { apiPatch } from '@/shared/api/client';

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, isAuthenticated, _hasHydrated, fetchMe } = useAuthStore();
  const router = useRouter();

  // _hasHydrated 타임아웃 fallback: 2초 후에도 hydration이 안 됐으면 강제로 완료 처리
  useEffect(() => {
    const t = setTimeout(() => {
      if (!useAuthStore.getState()._hasHydrated) {
        useAuthStore.setState({ _hasHydrated: true });
      }
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  // hydration 완료 후 인증 체크 → 비로그인 시 홈으로 리다이렉트
  useEffect(() => {
    if (!_hasHydrated || isAuthenticated) return;
    router.replace('/');
  }, [_hasHydrated, isAuthenticated, router]);

  // 마운트 시 최신 사용자 정보 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
    }
  }, [isAuthenticated]);

  // hydration 미완료 시 스피너
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 비로그인 시 빈 화면 (redirect useEffect가 처리)
  if (!isAuthenticated) return null;

  const NAV_TABS = [
    {
      id: 'overview', label: '대시보드', icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
      )
    },
    {
      id: 'orders', label: '주문 내역', icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
      )
    },
    {
      id: 'community', label: '커뮤니티 활동', icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.772-1.168M3 13V3a2 2 0 012-2h3" /></svg>
      )
    },
    {
      id: 'profile', label: '프로필 수정', icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      )
    },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'orders': return <OrdersSection />;
      case 'community': return <CommunitySection />;
      case 'profile': return <ProfileSection />;
      default: return <OverviewSection setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">

        {/* Left Sidebar */}
        <aside className="w-full md:w-60 flex-shrink-0">
            <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-sm border border-gray-100 dark:border-[#343536] overflow-hidden sticky top-20">
                <div className="p-6 border-b border-gray-100 dark:border-[#343536] text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl text-white font-black shadow-md">
                        {user?.nickname?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <h2 className="text-base font-black text-gray-900 dark:text-white">{user?.nickname ?? '사용자'}</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{user?.email ?? ''}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                      {user?.role === 'ADMIN' ? '관리자' : '골드 멤버'}
                    </p>
                    <div className="mt-4 flex justify-center gap-5">
                        <div className="text-center">
                            <div className="text-xs text-gray-400 mb-0.5">포인트</div>
                            <div className="text-sm font-black text-blue-600">2,450</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-gray-400 mb-0.5">쿠폰</div>
                            <div className="text-sm font-black text-blue-600">3장</div>
                        </div>
                    </div>
                </div>

                <nav className="p-2 space-y-0.5">
                    {NAV_TABS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                activeTab === item.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#272729] hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
            {renderContent()}
        </div>

      </main>
    </div>
  );
}

function OverviewSection({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">대시보드</h1>

            {/* Order Status */}
            <div data-testid="order-stats" className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MOCK_ORDER_STATS.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-[#1A1A1B] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-[#343536] text-center cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{stat.count}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-sm border border-gray-100 dark:border-[#343536] p-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-base text-gray-900 dark:text-white">최근 주문</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-sm text-blue-600 hover:underline font-semibold">전체 보기</button>
                </div>
                <div className="space-y-3">
                     {MOCK_RECENT_ORDERS.map((order) => (
                         <div key={order.id} className="flex gap-3 items-center border-b border-gray-50 dark:border-[#343536] last:border-0 pb-3 last:pb-0">
                             <div className="w-14 h-14 bg-gray-100 dark:bg-[#272729] rounded-xl flex-shrink-0"></div>
                             <div className="flex-1 min-w-0">
                                 <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{order.productName}</p>
                                 <p className="text-xs text-gray-400">{order.orderedAt} 주문</p>
                             </div>
                             <div className="text-right shrink-0">
                                 <p className="text-sm font-black text-gray-900 dark:text-white">{order.price}</p>
                                 <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold">{order.status}</span>
                             </div>
                         </div>
                     ))}
                </div>
            </div>

            {/* Community Activity */}
            <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-sm border border-gray-100 dark:border-[#343536] p-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-base text-gray-900 dark:text-white">최근 커뮤니티 활동</h3>
                    <button onClick={() => setActiveTab('community')} className="text-sm text-blue-600 hover:underline font-semibold">전체 보기</button>
                </div>
                <div className="space-y-2.5">
                    {MOCK_COMMUNITY_ACTIVITIES.map((activity, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#272729] rounded-xl">
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase w-14 text-center shrink-0 ${activity.color}`}>
                                {activity.type}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{activity.title}</p>
                                <p className="text-xs text-gray-400">{activity.time}</p>
                            </div>
                            {activity.karma > 0 && (
                                <div className="text-xs font-black text-orange-500 shrink-0">+{activity.karma}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function OrdersSection() {
    const ORDER_STATUSES = ['전체', '준비중', '배송 중', '배송 완료', '취소됨'];
    const [activeStatus, setActiveStatus] = useState('전체');

    const filteredOrders = activeStatus === '전체'
        ? MOCK_ORDERS
        : MOCK_ORDERS.filter(o => o.status === activeStatus);

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">주문 내역</h1>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {ORDER_STATUSES.map((status) => (
                    <button
                        key={status}
                        onClick={() => setActiveStatus(status)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                            activeStatus === status
                              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                              : 'bg-white dark:bg-[#1A1A1B] text-gray-500 border border-gray-200 dark:border-[#343536] hover:bg-gray-50 dark:hover:bg-[#272729]'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-sm border border-gray-100 dark:border-[#343536] overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 text-sm">해당 상태의 주문이 없습니다.</div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="p-5 border-b border-gray-100 dark:border-[#343536] last:border-0 hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors">
                            <div className="flex justify-between mb-3">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">주문번호 #{order.orderNo}</span>
                                    <p className="text-xs text-gray-400">{order.orderedAt} 주문</p>
                                </div>
                                <span className="text-sm font-bold text-blue-600">{order.status}</span>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-[72px] h-[72px] bg-gray-100 dark:bg-[#272729] rounded-xl flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-sm text-gray-900 dark:text-white">{order.productName}</h3>
                                    <p className="text-sm text-gray-400 mt-0.5">{order.option}</p>
                                    <p className="font-black text-sm mt-1 text-gray-900 dark:text-white">{order.price}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2 justify-end">
                                <button className="px-4 py-2 border border-gray-200 dark:border-[#343536] rounded-xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-[#343536] transition-colors text-gray-700 dark:text-gray-300">영수증</button>
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors">배송 추적</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function CommunitySection() {
    const [activeSubTab, setActiveSubTab] = useState<'posts' | 'communities' | 'comments' | 'saved'>('posts');
    const { user } = useAuthStore();
    const { posts, joinedCommunities } = useCommunityStore();
    const router = useRouter();

    // 내가 쓴 게시물: communityStore posts에서 author가 현재 user nickname과 일치하는 것만 필터
    const myPosts = posts.filter(p => p.author === user?.nickname);

    const SUB_TABS: { id: 'posts' | 'communities' | 'comments' | 'saved'; label: string }[] = [
        { id: 'posts', label: '내 게시물' },
        { id: 'communities', label: '내 커뮤니티' },
        { id: 'comments', label: '댓글' },
        { id: 'saved', label: '저장됨' },
    ];

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">커뮤니티 활동</h1>

            <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-sm border border-gray-100 dark:border-[#343536] overflow-hidden">
                <div className="flex border-b border-gray-100 dark:border-[#343536]">
                    {SUB_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${
                                activeSubTab === tab.id
                                  ? 'border-blue-500 text-blue-600'
                                  : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div>
                    {activeSubTab === 'posts' && (
                        myPosts.length === 0 ? (
                            <div className="p-10 text-center text-gray-400 text-sm">작성한 게시물이 없습니다.</div>
                        ) : (
                            myPosts.map((post) => (
                                <div
                                    key={post.id}
                                    onClick={() => router.push('/community/board/' + encodeURIComponent(post.community ?? '자유'))}
                                    className="p-4 border-b border-gray-50 dark:border-[#343536] last:border-0 hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors cursor-pointer"
                                >
                                    <p className="text-xs text-gray-400 mb-1">
                                        <span className="font-bold text-gray-600 dark:text-gray-300">{post.community ?? '자유'}</span> 게시판 •{' '}
                                        <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                                    </p>
                                    <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2 leading-snug">{post.title}</h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 font-bold">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6z"/></svg>
                                            {post.upvotes}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd"/></svg>
                                            {post.commentCount}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                    {activeSubTab === 'communities' && (
                        <div className="p-4 space-y-2">
                            {joinedCommunities.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">가입한 커뮤니티가 없습니다</p>
                            ) : (
                                joinedCommunities.map((communityName) => (
                                    <Link
                                        key={communityName}
                                        href={`/community/board/${communityName}`}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#272729] hover:bg-gray-100 dark:hover:bg-[#343536] transition-colors"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {communityName[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">r/{communityName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">커뮤니티</p>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                    {activeSubTab === 'comments' && (
                        <div className="p-10 text-center text-gray-400 text-sm">
                            댓글 내역은 준비 중입니다.
                        </div>
                    )}
                    {activeSubTab === 'saved' && (
                        <div className="p-10 text-center text-gray-400 text-sm">
                            저장된 게시물이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ProfileSection() {
    const { user, updateNickname, fetchMe } = useAuthStore();
    const { success: toastSuccess, error: toastError } = useToastStore();
    const [nickname, setNickname] = useState(user?.nickname ?? '');
    const [bio, setBio] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // user가 변경될 때 (fetchMe 완료 후) 닉네임 동기화
    useEffect(() => {
        if (user?.nickname) setNickname(user.nickname);
    }, [user?.nickname]);

    const handleSave = async () => {
        if (!user) return;
        const trimmed = nickname.trim();
        if (!trimmed || trimmed === user?.nickname) {
            return;
        }

        setIsSaving(true);
        try {
            await apiPatch('/api/v1/users/me', { nickname: trimmed });
            updateNickname(trimmed);
            toastSuccess('프로필이 저장되었습니다.');
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);

            // 서버에서 최신 정보 동기화
            await fetchMe();
        } catch (err) {
            const message = err instanceof Error ? err.message : '저장에 실패했습니다.';
            toastError(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">계정 설정</h1>

            <div className="bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#343536]">
                <h3 className="font-black text-base text-gray-900 dark:text-white mb-5">프로필 수정</h3>
                <div className="flex items-start gap-6">
                    <div className="relative group shrink-0 text-center">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl text-white font-black shadow-md">
                          {nickname.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-2">{nickname}</p>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">닉네임</label>
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    aria-label="닉네임"
                                    maxLength={20}
                                    className="w-full p-3 bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">이메일</label>
                                <input
                                    type="email"
                                    value={user?.email ?? ''}
                                    disabled
                                    className="w-full p-3 bg-gray-100 dark:bg-[#343536] border border-gray-200 dark:border-[#343536] rounded-xl outline-none text-gray-400 cursor-not-allowed text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">자기소개</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all h-20 resize-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                                placeholder="간단한 자기소개를 작성해주세요..."
                                maxLength={200}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                             <button
                                 onClick={handleSave}
                                 disabled={isSaving}
                                 className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm shadow-sm"
                             >
                                 {isSaving ? '저장 중...' : saved ? '저장됨!' : '변경 저장'}
                             </button>
                             <button
                                 onClick={() => { setNickname(user?.nickname ?? ''); setBio(''); }}
                                 disabled={isSaving}
                                 className="px-5 py-2.5 border border-gray-200 dark:border-[#343536] hover:bg-gray-50 dark:hover:bg-[#343536] disabled:opacity-60 font-bold rounded-xl transition-colors text-sm text-gray-700 dark:text-gray-300"
                             >
                                 취소
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#343536]">
                <h3 className="font-black text-base text-gray-900 dark:text-white mb-5">보안</h3>
                <div className="space-y-0">
                  <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-[#343536]">
                      <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">비밀번호</p>
                          <p className="text-xs text-gray-400 mt-0.5">3개월 전 마지막 변경</p>
                      </div>
                      <button className="px-4 py-2 border border-gray-200 dark:border-[#343536] rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#343536] transition-colors text-gray-700 dark:text-gray-300">변경</button>
                  </div>
                  <div className="flex items-center justify-between py-4">
                      <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">계정 정보</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            가입일: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}
                          </p>
                      </div>
                      <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold">
                        {user?.provider === 'LOCAL' ? '이메일 계정' : `${user?.provider} 로그인`}
                      </span>
                  </div>
                </div>
            </div>
        </div>
    );
}
