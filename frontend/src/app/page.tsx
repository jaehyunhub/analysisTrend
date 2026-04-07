import HomeContent from './_home-content';
import type { BannerItem, YoutubeItem, ProductItem, PostItem, ScheduleItem } from './_home-content';

// 60초마다 Vercel CDN이 페이지를 백그라운드에서 재생성 (ISR)
export const revalidate = 60;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.syukauniverse.com';

async function fetchJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return fallback;
    const json = await res.json();
    // ApiResponse<T> 래퍼 { success, data, ... } 자동 언래핑 (client.ts apiGet 동일 로직)
    return (json?.data ?? json) as T;
  } catch {
    return fallback;
  }
}

export default async function Home() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [allBanners, videos, productsPage, postsPage, schedules] = await Promise.all([
    fetchJSON<BannerItem[]>('/api/v1/banners', []),
    fetchJSON<YoutubeItem[]>('/api/v1/youtube', []),
    fetchJSON<{ content: ProductItem[] }>('/api/v1/products?page=0&size=4', { content: [] }),
    fetchJSON<{ content: PostItem[] }>('/api/v1/posts?page=0&size=40&sort=hot', { content: [] }),
    fetchJSON<ScheduleItem[]>(`/api/v1/schedules/month?year=${year}&month=${month}`, []),
  ]);

  const activeBanners = allBanners
    .filter(b => b.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <HomeContent
      initialBanners={activeBanners}
      initialVideos={videos}
      initialProducts={productsPage.content}
      initialPosts={postsPage.content}
      initialSchedules={schedules}
      initialYear={year}
      initialMonth={month}
    />
  );
}
