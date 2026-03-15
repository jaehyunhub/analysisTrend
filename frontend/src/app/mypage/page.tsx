'use client';

import { useState } from 'react';
import Header from "@/widgets/Header/ui/Header";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch(activeTab) {
      case 'orders': return <OrdersSection />;
      case 'community': return <CommunitySection />;
      case 'profile': return <ProfileSection />;
      default: return <OverviewSection setActiveTab={setActiveTab} />;
    }
  };

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
      id: 'profile', label: '계정 설정', icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">

        {/* Left Sidebar */}
        <aside className="w-full md:w-60 flex-shrink-0">
            <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-sm border border-gray-100 dark:border-[#343536] overflow-hidden sticky top-20">
                <div className="p-6 border-b border-gray-100 dark:border-[#343536] text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl text-white font-black shadow-md">
                        김
                    </div>
                    <h2 className="text-base font-black text-gray-900 dark:text-white">김재현</h2>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">골드 멤버</p>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: '결제 대기', count: 0, icon: '💳' },
                    { label: '처리 중', count: 1, icon: '📦' },
                    { label: '배송 중', count: 2, icon: '🚚' },
                    { label: '후기 필요', count: 5, icon: '✍️' },
                ].map((stat) => (
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
                     {[1, 2].map((i) => (
                         <div key={i} className="flex gap-3 items-center border-b border-gray-50 dark:border-[#343536] last:border-0 pb-3 last:pb-0">
                             <div className="w-14 h-14 bg-gray-100 dark:bg-[#272729] rounded-xl flex-shrink-0"></div>
                             <div className="flex-1 min-w-0">
                                 <p className="font-bold text-sm text-gray-900 dark:text-white truncate">프리미엄 기계식 키보드 키캡 세트</p>
                                 <p className="text-xs text-gray-400">2026년 2월 {i + 7}일 주문</p>
                             </div>
                             <div className="text-right shrink-0">
                                 <p className="text-sm font-black text-gray-900 dark:text-white">45,000원</p>
                                 <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold">배송 중</span>
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
                    {[
                        { type: '게시물', title: '2026년 AI 투자 트렌드 어떻게 보시나요?', time: '2시간 전', karma: 12, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
                        { type: '댓글', title: '금리 인하 시대의 부동산 전략 게시물에 댓글', time: '5시간 전', karma: 3, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
                        { type: '저장', title: 'React Server Components 완벽 가이드', time: '1일 전', karma: 0, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
                    ].map((activity, i) => (
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
    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">주문 내역</h1>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {['전체', '처리 중', '배송 중', '배송 완료', '취소됨'].map((status, i) => (
                    <button key={status} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                        i === 0
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'bg-white dark:bg-[#1A1A1B] text-gray-500 border border-gray-200 dark:border-[#343536] hover:bg-gray-50 dark:hover:bg-[#272729]'
                    }`}>
                        {status}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-sm border border-gray-100 dark:border-[#343536] overflow-hidden">
                {[1, 2, 3].map((order) => (
                    <div key={order} className="p-5 border-b border-gray-100 dark:border-[#343536] last:border-0 hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors">
                        <div className="flex justify-between mb-3">
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">주문번호 #ORD-2026-00{order}</span>
                                <p className="text-xs text-gray-400">2026년 2월 0{order}일 주문</p>
                            </div>
                            <span className="text-sm font-bold text-blue-600">배송 중</span>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-18 h-18 w-[72px] h-[72px] bg-gray-100 dark:bg-[#272729] rounded-xl flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-sm text-gray-900 dark:text-white">무선 노이즈캔슬링 헤드폰</h3>
                                <p className="text-sm text-gray-400 mt-0.5">색상: 블랙, 수량: 1</p>
                                <p className="font-black text-sm mt-1 text-gray-900 dark:text-white">299,000원</p>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2 justify-end">
                            <button className="px-4 py-2 border border-gray-200 dark:border-[#343536] rounded-xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-[#343536] transition-colors text-gray-700 dark:text-gray-300">영수증</button>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors">배송 추적</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CommunitySection() {
    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">커뮤니티 활동</h1>

            <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-sm border border-gray-100 dark:border-[#343536] overflow-hidden">
                <div className="flex border-b border-gray-100 dark:border-[#343536]">
                    {['내 게시물', '댓글', '저장됨'].map((tab, i) => (
                        <button key={tab} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${
                            i === 0
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}>
                            {tab}
                        </button>
                    ))}
                </div>

                <div>
                    {[1, 2, 3, 4].map((post) => (
                        <div key={post} className="p-4 border-b border-gray-50 dark:border-[#343536] last:border-0 hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors">
                            <p className="text-xs text-gray-400 mb-1">
                              <span className="font-bold text-gray-600 dark:text-gray-300">경제</span> 게시판 •{' '}
                              <span>2일 전</span>
                            </p>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2 leading-snug">2026년 AI 트렌드 분석 및 2027년 전망</h3>
                            <div className="flex items-center gap-4 text-xs text-gray-400 font-bold">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6z"/></svg>
                                  152
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd"/></svg>
                                  45
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ProfileSection() {
    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">계정 설정</h1>

            <div className="bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#343536]">
                <h3 className="font-black text-base text-gray-900 dark:text-white mb-5">프로필 수정</h3>
                <div className="flex items-start gap-6">
                    <div className="relative group shrink-0">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl text-white font-black shadow-md">
                          김
                        </div>
                        <button className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                        </button>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">닉네임</label>
                                <input type="text" defaultValue="김재현" className="w-full p-3 bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-gray-900 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">이메일</label>
                                <input type="email" defaultValue="jaehyun@example.com" disabled className="w-full p-3 bg-gray-100 dark:bg-[#343536] border border-gray-200 dark:border-[#343536] rounded-xl outline-none text-gray-400 cursor-not-allowed text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">자기소개</label>
                            <textarea className="w-full p-3 bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all h-20 resize-none text-sm text-gray-900 dark:text-white placeholder-gray-400" placeholder="간단한 자기소개를 작성해주세요..."></textarea>
                        </div>

                        <div className="flex gap-3 pt-2">
                             <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm shadow-sm">변경 저장</button>
                             <button className="px-5 py-2.5 border border-gray-200 dark:border-[#343536] hover:bg-gray-50 dark:hover:bg-[#343536] font-bold rounded-xl transition-colors text-sm text-gray-700 dark:text-gray-300">취소</button>
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
                          <p className="font-bold text-sm text-gray-900 dark:text-white">2단계 인증</p>
                          <p className="text-xs text-gray-400 mt-0.5">계정에 추가적인 보안을 적용합니다</p>
                      </div>
                      <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold">활성화됨</span>
                  </div>
                </div>
            </div>
        </div>
    );
}
