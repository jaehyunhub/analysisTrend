'use client';

import { useState } from "react";
import Header from "@/widgets/Header/ui/Header";
import Footer from "@/widgets/Footer/ui/Footer";
import Link from "next/link";
import { SCHEDULE_DAYS, MOCK_BROADCAST_NEWS, MOCK_SCHEDULES, BROADCAST_DATES } from "@/shared/mocks/schedules";
import type { BroadcastNews } from '@/shared/types/schedule';
import { MOCK_VIDEOS } from "@/shared/mocks/videos";
import { SHOP_PREVIEW_ITEMS } from "@/shared/mocks/products";

const POPULAR_POSTS = {
  '경제': [
    { rank: 1, title: '비트코인 신고가 돌파! 투자 전략은?', comments: 124 },
    { rank: 2, title: '금리 인하 가능성 재점화 분석', comments: 85 },
    { rank: 3, title: '2026 베스트 적금 상품 추천', comments: 42 },
    { rank: 4, title: '부동산 거품 논쟁, 어떻게 봐야 하나', comments: 38 },
    { rank: 5, title: '내 포트폴리오 공개합니다 (피드백 환영)', comments: 22 },
  ],
  '자유게시판': [
    { rank: 1, title: '오늘 방송 진짜 감동이었다...', comments: 512 },
    { rank: 2, title: '주말 여행 추천해주세요', comments: 230 },
    { rank: 3, title: '오늘 퇴사했습니다 ㅋㅋ', comments: 189 },
    { rank: 4, title: '어제 경기 보신 분?', comments: 150 },
    { rank: 5, title: '근처 맛집 추천 부탁드려요', comments: 98 },
  ],
  '쇼핑': [
    { rank: 1, title: 'RTX 6090 재고 떴습니다!', comments: 445 },
    { rank: 2, title: '키보드 공동구매 진행 중', comments: 120 },
    { rank: 3, title: '이 자켓 가격 대비 괜찮나요?', comments: 88 },
    { rank: 4, title: '모니터 50% 할인 특가', comments: 76 },
    { rank: 5, title: '신발 드랍 정보 공유', comments: 54 },
  ],
  '방송': [
    { rank: 1, title: '이번 방송 클립 진짜 레전드였다', comments: 890 },
    { rank: 2, title: '어젯밤 라이브 하이라이트 모음', comments: 432 },
    { rank: 3, title: '방송 일정 변경 관련 문의', comments: 210 },
    { rank: 4, title: '팬아트 공모전 참여 후기', comments: 150 },
    { rank: 5, title: '방송용 마이크 추천해주세요', comments: 90 },
  ],
};

const CATEGORY_COLORS: Record<string, string> = {
  '경제': 'bg-blue-500',
  '자유게시판': 'bg-green-500',
  '쇼핑': 'bg-orange-500',
  '방송': 'bg-red-500',
};

export default function Home() {
  const [selectedNews, setSelectedNews] = useState<BroadcastNews | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  return (
    <div className="bg-white dark:bg-black min-h-screen text-black dark:text-white">
      <Header />

      <main className="flex flex-col gap-0 pb-20">
        {/* 1. Hero / Main Banner */}
        <section className="w-full h-[440px] bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "60px 60px"}}></div>
             <div className="text-center z-10 text-white px-4">
                 <p className="text-sm font-medium text-blue-300 mb-3 tracking-widest uppercase">경제·시사 유튜브 채널 공식 플랫폼</p>
                 <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                   트렌드를 읽는 가장 빠른 방법
                 </h1>
                 <p className="text-lg text-blue-200 mb-8 max-w-lg mx-auto">커뮤니티, 방송 일정, 쇼핑을 한 곳에서. 데이터 기반 경제 분석 채널과 함께하세요.</p>
                 <div className="flex flex-col sm:flex-row gap-3 justify-center">
                   <Link href="/community" className="px-7 py-3 bg-white text-blue-900 font-bold rounded-full hover:bg-blue-50 transition-colors text-sm">
                     커뮤니티 참여하기
                   </Link>
                   <a href="#videos" className="px-7 py-3 border border-white/40 text-white font-bold rounded-full hover:bg-white/10 transition-colors text-sm">
                     최신 영상 보기
                   </a>
                 </div>
             </div>
        </section>

        {/* Content Container */}
        <div className="max-w-[1200px] mx-auto w-full px-6 flex flex-col gap-12 mt-10 relative">

            {/* Side Banner (Ad) */}
            <aside className="hidden 2xl:block absolute -right-[190px] top-0 h-full w-[160px]">
                <div className="sticky top-24 flex flex-col gap-4">
                    <div className="bg-white dark:bg-[#1A1A1B] p-3 rounded-xl border border-gray-200 dark:border-[#343536] shadow-lg cursor-pointer hover:-translate-y-1 transition-transform">
                        <div className="w-full h-[140px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mb-2 flex flex-col items-center justify-center text-white p-2 text-center">
                            <span className="font-black text-lg">PRO</span>
                            <span className="text-xs opacity-90">분석 구독</span>
                        </div>
                        <p className="text-center text-sm font-bold">무료 체험</p>
                    </div>

                    <div className="bg-white dark:bg-[#1A1A1B] p-3 rounded-xl border border-gray-200 dark:border-[#343536] shadow-lg cursor-pointer hover:-translate-y-1 transition-transform">
                        <div className="w-full h-[140px] bg-gray-100 dark:bg-[#272729] rounded-lg mb-2 flex items-center justify-center text-gray-400 text-xs text-center border border-dashed border-gray-300 dark:border-gray-700">
                            광고 영역<br/>문의하기
                        </div>
                        <p className="text-center text-xs text-gray-500">광고 문의</p>
                    </div>
                </div>
            </aside>

            {/* 2. Schedule + Board */}
            <section className="flex flex-col md:flex-row gap-6">
                {/* Left: Schedule */}
                <div className="flex-1 bg-gray-50 dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-200 dark:border-[#343536]">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="w-2 h-5 bg-red-500 rounded-full"></span>
                            방송 일정
                        </h2>
                        <span className="text-xs text-gray-500 font-medium">2026년 3월</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {SCHEDULE_DAYS.map((d, i) => (
                          <div key={d} className={`text-xs font-bold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {[...Array(31)].map((_, i) => {
                          const isBroadcast = BROADCAST_DATES.includes(i);
                          const isToday = i === 14;
                          return (
                            <div key={i} onClick={() => isBroadcast ? setSelectedDate(i + 1) : undefined} className={`aspect-square flex items-center justify-center text-sm rounded-lg relative ${
                              isToday ? 'bg-red-500 text-white font-bold' :
                              isBroadcast ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' :
                              'bg-white dark:bg-[#272729] hover:bg-gray-100 dark:hover:bg-[#343536] text-gray-700 dark:text-gray-300'
                            } cursor-pointer transition-colors`}>
                              {i + 1}
                              {isBroadcast && !isToday && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span>오늘</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>방송 예정일</span>
                    </div>
                </div>

                {/* Right: Broadcast Board */}
                <div className="flex-1 bg-white dark:bg-black p-6 rounded-2xl border border-gray-200 dark:border-[#343536]">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                             <span className="w-2 h-5 bg-blue-500 rounded-full"></span>
                             방송 공지
                        </h2>
                        <Link href="/community" className="text-xs text-gray-400 hover:text-blue-500 font-medium transition-colors">더 보기 +</Link>
                    </div>
                    <ul className="flex flex-col divide-y divide-gray-100 dark:divide-[#343536]">
                        {MOCK_BROADCAST_NEWS.map(item => (
                            <li key={item.id} onClick={() => setSelectedNews(item)} className="py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-[#1A1A1B] px-2 rounded-lg cursor-pointer transition-colors group">
                                <span className="text-sm truncate pr-4 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</span>
                                <span className="text-xs text-gray-400 font-mono shrink-0">{item.date}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* 3. Recent YouTube Videos */}
            <section id="videos">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                      <svg className="w-7 h-7 text-red-600 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                      최신 유튜브 영상
                  </h2>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors">유튜브에서 더 보기 →</a>
                </div>
                <div data-testid="video-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {MOCK_VIDEOS.map(video => (
                        <div key={video.id} data-testid="video-card" className="group cursor-pointer">
                            <div className={`aspect-video rounded-xl mb-3 ${video.thumbnail} relative overflow-hidden shadow-sm`}>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
                                      <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">10:35</span>
                            </div>
                            <h3 className="font-semibold text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1.5 line-clamp-2 text-gray-900 dark:text-gray-100">{video.title}</h3>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                <span>조회수 {video.views}</span>
                                <span>•</span>
                                <span>{video.duration}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Community Boards */}
            <section className="bg-gray-50 dark:bg-[#1A1A1B] p-8 rounded-2xl w-full">
                 <div className="flex items-center justify-between mb-7">
                   <h2 className="text-xl font-bold flex items-center gap-2">
                     <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/></svg>
                     커뮤니티 인기글
                   </h2>
                   <Link href="/community" className="text-sm text-gray-400 hover:text-blue-500 font-medium transition-colors">전체 보기 →</Link>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                     {Object.entries(POPULAR_POSTS).map(([category, posts]) => (
                         <div key={category} className="bg-white dark:bg-black p-4 rounded-xl border border-gray-100 dark:border-[#343536] shadow-sm">
                             <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-[#343536] pb-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[category]}`}></div>
                                  <h3 className="font-bold text-sm">{category}</h3>
                                </div>
                                <Link href="/community" className="text-xs text-gray-400 hover:text-blue-500">전체</Link>
                             </div>
                             <ul className="flex flex-col gap-3">
                                 {posts.map((post, i) => (
                                     <li key={i} className="flex gap-2.5 items-start group cursor-pointer">
                                         <span className={`text-xs font-black w-4 text-center mt-0.5 ${post.rank <= 3 ? 'text-red-500' : 'text-gray-300 dark:text-gray-600'}`}>{post.rank}</span>
                                         <div className="flex-1 min-w-0">
                                             <div className="text-xs text-gray-700 dark:text-gray-300 leading-snug group-hover:text-blue-500 transition-colors line-clamp-2">
                                                 {post.title}
                                             </div>
                                             <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                 <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
                                                 댓글 {post.comments}
                                             </div>
                                         </div>
                                     </li>
                                 ))}
                             </ul>
                         </div>
                     ))}
                 </div>
            </section>

             {/* 5. Shop Section */}
             <section className="pb-10">
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-[#343536] pb-4">
                    <h2 className="text-xl font-bold">공식 쇼핑몰</h2>
                    <Link href="/shop" className="text-sm text-gray-400 hover:text-purple-500 font-medium transition-colors">전체 상품 보기 →</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
                    {SHOP_PREVIEW_ITEMS.map(product => (
                        <Link href={`/shop/${product.id}`} key={product.id} className="group cursor-pointer block">
                            <div className={`aspect-square rounded-2xl mb-3 overflow-hidden ${product.image} relative shadow-sm`}>
                               {product.badge && (
                                   <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10">
                                       {product.badge}
                                   </span>
                               )}
                               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <span className="bg-white/90 text-gray-900 text-xs font-bold px-4 py-2 rounded-full shadow">바로 구매</span>
                               </div>
                            </div>
                            <h3 className="font-medium text-sm mb-1 group-hover:text-purple-600 transition-colors line-clamp-2 text-gray-800 dark:text-gray-200 leading-snug">{product.title}</h3>
                            <p className="font-bold text-base text-gray-900 dark:text-white">{product.price}</p>
                        </Link>
                    ))}
                </div>
            </section>

        </div>
      </main>

      {/* 방송 공지 상세 모달 */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedNews(null)}>
          <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-[#343536]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {selectedNews.category}
              </span>
              <button onClick={() => setSelectedNews(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl leading-none">×</button>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{selectedNews.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-mono">{selectedNews.date}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedNews.content}</p>
          </div>
        </div>
      )}

      {/* 방송 일정 날짜 클릭 상세 모달 */}
      {selectedDate !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDate(null)}>
          <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-gray-200 dark:border-[#343536]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">📅 {selectedDate}일 방송 일정</h3>
              <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl leading-none">×</button>
            </div>
            <div className="space-y-3">
              {MOCK_SCHEDULES.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-600 text-white">{s.time}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.day}요일</p>
                  </div>
                  {s.isLive && <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">LIVE</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
