'use client';

import { useState, useEffect } from "react";
import Header from "@/widgets/Header/ui/Header";
import Footer from "@/widgets/Footer/ui/Footer";
import Link from "next/link";
import { apiGet } from "@/shared/api/client";
import { SCHEDULES } from "@/shared/api/endpoints";
import type { BroadcastNews } from '@/shared/types/schedule';
import { useAdsStore } from '@/shared/model/adsStore';

const SCHEDULE_DAYS: string[] = ['일', '월', '화', '수', '목', '금', '토'];

const CATEGORY_COLORS: Record<string, string> = {
  '경제': 'bg-blue-500',
  '자유게시판': 'bg-green-500',
  '쇼핑': 'bg-orange-500',
  '방송': 'bg-red-500',
};

export interface ScheduleItem {
  id: number;
  title: string;
  scheduleDate: string;
  type: string;
  description: string;
}

export interface YoutubeItem {
  id: number;
  title: string;
  videoId: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: string;
  displayOrder: number;
}

export interface ProductItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  isSoldOut: boolean;
  imageUrl: string;
  description: string;
}

export interface PostItem {
  id: number;
  title: string;
  content: string;
  authorNickname: string;
  communityName: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: string;
}

export interface BannerItem {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  active: boolean;
  displayOrder: number;
}

interface HomeContentProps {
  initialBanners: BannerItem[];
  initialVideos: YoutubeItem[];
  initialProducts: ProductItem[];
  initialPosts: PostItem[];
  initialSchedules: ScheduleItem[];
  initialYear: number;
  initialMonth: number;
}

export default function HomeContent({
  initialBanners,
  initialVideos,
  initialProducts,
  initialPosts,
  initialSchedules,
  initialYear,
  initialMonth,
}: HomeContentProps) {
  const [selectedNews, setSelectedNews] = useState<BroadcastNews | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [banners] = useState<BannerItem[]>(initialBanners);
  const [videos] = useState<YoutubeItem[]>(initialVideos);
  const [products] = useState<ProductItem[]>(initialProducts);
  const [posts] = useState<PostItem[]>(initialPosts);
  const [bannerIndex, setBannerIndex] = useState(0);

  const { ads } = useAdsStore();
  const activeAds = ads.filter(a => a.active !== false);

  const [adsVisible, setAdsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ads-sidebar-dismissed') !== 'true';
    }
    return true;
  });

  const now = new Date();
  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  const broadcastDates = schedules.map(s => {
    const day = new Date(s.scheduleDate).getDate();
    return day - 1;
  });

  const broadcastNews: BroadcastNews[] = schedules.map(s => ({
    id: s.id,
    title: s.title,
    content: s.description || s.title,
    date: s.scheduleDate.slice(5).replace('-', '.'),
    category: s.type || '방송',
  }));

  const selectedDateSchedules = selectedDate
    ? schedules.filter(s => {
        const d = new Date(s.scheduleDate);
        return d.getFullYear() === viewYear && d.getMonth() + 1 === viewMonth && d.getDate() === selectedDate;
      })
    : [];

  // 월 변경 시에만 클라이언트에서 재호출
  useEffect(() => {
    if (viewYear === initialYear && viewMonth === initialMonth) return;
    apiGet<ScheduleItem[]>(SCHEDULES.BY_MONTH(viewYear, viewMonth))
      .then(setSchedules)
      .catch(() => {});
  }, [viewYear, viewMonth, initialYear, initialMonth]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIndex(i => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const FIXED_CATEGORIES = ['경제', '방송', '쇼핑', '자유게시판'];
  const postsByCategory: Record<string, { rank: number; id: number; title: string; comments: number }[]> = Object.fromEntries(
    FIXED_CATEGORIES.map(cat => [cat, []])
  );
  posts.forEach(post => {
    const cat = post.communityName || '자유게시판';
    if (cat in postsByCategory && postsByCategory[cat].length < 5) {
      postsByCategory[cat].push({
        rank: postsByCategory[cat].length + 1,
        id: post.id,
        title: post.title,
        comments: post.commentCount ?? 0,
      });
    }
  });

  const formatPrice = (price: number) => price.toLocaleString('ko-KR') + '원';

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth - 1, 1).getDay();

  return (
    <div className="bg-white dark:bg-black min-h-screen text-black dark:text-white">
      <Header />

      {/* 광고 플로팅 사이드바 */}
      {adsVisible && activeAds.length > 0 && (
        <div className="fixed right-4 bottom-20 z-30 w-[180px] flex flex-col gap-2">
          <div className="flex justify-between items-center bg-white dark:bg-[#1A1A1B] rounded-t-xl border border-gray-200 dark:border-[#343536] px-3 py-2 shadow-lg">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">추천 광고</span>
            <button
              onClick={() => {
                setAdsVisible(false);
                localStorage.setItem('ads-sidebar-dismissed', 'true');
              }}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              aria-label="광고 닫기"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-2 bg-white dark:bg-[#1A1A1B] border border-t-0 border-gray-200 dark:border-[#343536] rounded-b-xl shadow-lg p-2 overflow-hidden max-h-[60vh] overflow-y-auto">
            {activeAds.slice(0, 3).map(ad => (
              <a
                key={ad.id}
                href={ad.link || '#'}
                target={ad.link && ad.link.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="block rounded-lg overflow-hidden border border-gray-100 dark:border-[#343536] hover:shadow-md hover:scale-[1.02] transition-all"
              >
                <div className={`w-full h-[90px] flex flex-col items-center justify-center text-center text-xs p-2 overflow-hidden
                  ${!ad.imageUrl && ad.type === 'gradient' ? `bg-gradient-to-br ${ad.color} text-white` : ''}
                  ${!ad.imageUrl && ad.type === 'placeholder' ? 'bg-gray-100 dark:bg-[#272729] text-gray-400' : ''}
                `}>
                  {ad.imageUrl ? (
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-sm">{ad.title}</span>
                  )}
                </div>
                <div className="bg-white dark:bg-[#1A1A1B] px-2 py-1.5">
                  <p className="font-bold text-[11px] text-gray-900 dark:text-white truncate">{ad.subtitle || ad.title}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <main className="flex flex-col gap-0 pb-20">
        {/* 1. Hero / Main Banner */}
        {banners.length > 0 ? (
          <section className="w-full h-[440px] relative overflow-hidden">
            {banners.map((banner, idx) => {
              const isActive = idx === bannerIndex;
              const isImage = banner.imageUrl && (banner.imageUrl.startsWith('http') || banner.imageUrl.startsWith('data:'));
              const isCssClass = banner.imageUrl && !isImage;
              return (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${isCssClass ? banner.imageUrl : 'bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900'} flex items-center justify-center`}
                >
                  {isImage && (
                    <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="text-center z-10 text-white px-4 relative">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight drop-shadow-lg">
                      {banner.title}
                    </h1>
                    {banner.subtitle && (
                      <p className="text-lg text-blue-100 mb-8 max-w-lg mx-auto drop-shadow">{banner.subtitle}</p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/community" className="px-7 py-3 bg-white text-blue-900 font-bold rounded-full hover:bg-blue-50 transition-colors text-sm">
                        커뮤니티 참여하기
                      </Link>
                      <a href="#videos" className="px-7 py-3 border border-white/40 text-white font-bold rounded-full hover:bg-white/10 transition-colors text-sm">
                        최신 영상 보기
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setBannerIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === bannerIndex ? 'bg-white w-5' : 'bg-white/50'}`}
                    aria-label={`배너 ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
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
        )}

        {/* Content Container */}
        <div className="max-w-[1200px] mx-auto w-full px-6 flex flex-col gap-12 mt-10 relative">

            {/* 2. Schedule + Board */}
            <section className="flex flex-col md:flex-row gap-6">
                {/* Left: Schedule */}
                <div className="flex-1 bg-gray-50 dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-200 dark:border-[#343536]">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="w-2 h-5 bg-red-500 rounded-full"></span>
                            방송 일정
                        </h2>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedDate(null);
                              if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
                              else setViewMonth(m => m - 1);
                            }}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#343536] transition-colors text-gray-500"
                            aria-label="이전 달"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                          </button>
                          <span className="text-xs text-gray-500 font-medium min-w-[60px] text-center">{viewYear}년 {viewMonth}월</span>
                          <button
                            onClick={() => {
                              setSelectedDate(null);
                              if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
                              else setViewMonth(m => m + 1);
                            }}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#343536] transition-colors text-gray-500"
                            aria-label="다음 달"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                          </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {SCHEDULE_DAYS.map((d, i) => (
                          <div key={d} className={`text-xs font-bold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {[...Array(firstDayOfMonth)].map((_, i) => (
                          <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        {[...Array(daysInMonth)].map((_, i) => {
                          const isBroadcast = broadcastDates.includes(i);
                          const isToday = viewYear === now.getFullYear() && viewMonth === (now.getMonth() + 1) && i + 1 === now.getDate();
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
                        {broadcastNews.map(item => (
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
                    {videos.map(video => (
                        <a key={video.id} href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" data-testid="video-card" className="group cursor-pointer block">
                            <div className="aspect-video rounded-xl mb-3 relative overflow-hidden shadow-sm bg-gray-200 dark:bg-gray-800">
                                <img
                                  src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
                                      <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                                {video.duration && (
                                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">{video.duration}</span>
                                )}
                            </div>
                            <h3 className="font-semibold text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1.5 line-clamp-2 text-gray-900 dark:text-gray-100">{video.title}</h3>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                <span>조회수 {video.viewCount}</span>
                                {video.duration && (
                                  <>
                                    <span>•</span>
                                    <span>{video.duration}</span>
                                  </>
                                )}
                            </div>
                        </a>
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
                     {FIXED_CATEGORIES.map(category => { const categoryPosts = postsByCategory[category]; return (
                         <div key={category} className="bg-white dark:bg-black p-4 rounded-xl border border-gray-100 dark:border-[#343536] shadow-sm">
                             <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-[#343536] pb-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[category] || 'bg-gray-500'}`}></div>
                                  <h3 className="font-bold text-sm">{category}</h3>
                                </div>
                                <Link href="/community" className="text-xs text-gray-400 hover:text-blue-500">전체</Link>
                             </div>
                             <ul className="flex flex-col gap-3">
                                 {categoryPosts.map((post, i) => (
                                     <li key={i}>
                                       <Link href={`/community/board/${encodeURIComponent(category)}/comments/${post.id}`} className="flex gap-2.5 items-start group cursor-pointer">
                                         <span className={`text-xs font-black w-4 text-center mt-0.5 shrink-0 ${post.rank <= 3 ? 'text-red-500' : 'text-gray-300 dark:text-gray-600'}`}>{post.rank}</span>
                                         <div className="flex-1 min-w-0">
                                             <div className="text-xs text-gray-700 dark:text-gray-300 leading-snug group-hover:text-blue-500 transition-colors line-clamp-2">
                                                 {post.title}
                                             </div>
                                             <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                 <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
                                                 댓글 {post.comments}
                                             </div>
                                         </div>
                                       </Link>
                                     </li>
                                 ))}
                             </ul>
                         </div>
                     );})}
                 </div>
            </section>

             {/* 5. Shop Section */}
             <section className="pb-10">
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-[#343536] pb-4">
                    <h2 className="text-xl font-bold">공식 쇼핑몰</h2>
                    <Link href="/shop" className="text-sm text-gray-400 hover:text-purple-500 font-medium transition-colors">전체 상품 보기 →</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
                    {products.map(product => (
                        <Link href={`/shop/${product.id}`} key={product.id} className="group cursor-pointer block">
                            <div className="aspect-square rounded-2xl mb-3 overflow-hidden relative shadow-sm bg-gray-200 dark:bg-gray-800">
                               {product.imageUrl ? (
                                 <img
                                   src={product.imageUrl}
                                   alt={product.name}
                                   className="w-full h-full object-cover"
                                   onError={(e) => {
                                     const el = e.currentTarget;
                                     el.onerror = null;
                                     el.style.display = 'none';
                                   }}
                                 />
                               ) : (
                                 <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                               )}
                               {product.discount && product.discount > 0 && (
                                   <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10">
                                       {product.discount}% 할인
                                   </span>
                               )}
                               {product.isSoldOut && (
                                   <span className="absolute top-2 left-2 bg-gray-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10">
                                       품절
                                   </span>
                               )}
                               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <span className="bg-white/90 text-gray-900 text-xs font-bold px-4 py-2 rounded-full shadow">바로 구매</span>
                               </div>
                            </div>
                            <h3 className="font-medium text-sm mb-1 group-hover:text-purple-600 transition-colors line-clamp-2 text-gray-800 dark:text-gray-200 leading-snug">{product.name}</h3>
                            <p className="font-bold text-base text-gray-900 dark:text-white">{formatPrice(product.price)}</p>
                        </Link>
                    ))}
                </div>
            </section>

        </div>
      </main>

      {/* 방송 공지 상세 모달 */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setSelectedNews(null)}>
          <div className="relative bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-[#343536]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2D2F3A] flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-3">
              {selectedNews.category}
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 pr-8">{selectedNews.title}</h3>
            <p className="text-sm text-gray-400 mb-4">{selectedNews.date}</p>
            <hr className="border-gray-100 dark:border-[#343536] mb-4" />
            <div className="max-h-[40vh] overflow-y-auto">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedNews.content}</p>
            </div>
          </div>
        </div>
      )}

      {/* 방송 일정 날짜 클릭 상세 모달 */}
      {selectedDate !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setSelectedDate(null)}>
          <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-gray-200 dark:border-[#343536]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {viewYear}년 {viewMonth}월 {selectedDate}일 방송 일정
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#2D2F3A] text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {selectedDateSchedules.length > 0 ? selectedDateSchedules.map(s => (
                <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-600 text-white flex-shrink-0">{s.type}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.scheduleDate}</p>
                    {s.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{s.description}</p>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-400">예정된 방송 일정이 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
