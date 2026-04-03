import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Ad {
  id: number;
  title: string;
  subtitle: string;
  type: 'gradient' | 'placeholder';
  link?: string;
  color?: string;
  imageUrl?: string;
  active?: boolean;
}

interface AdsState {
  ads: Ad[];
  setAds: (ads: Ad[]) => void;
  addAd: (ad: Omit<Ad, 'id'>) => void;
  updateAd: (id: number, data: Partial<Ad>) => void;
  removeAd: (id: number) => void;
}

export const useAdsStore = create<AdsState>()(
  persist(
    (set, get) => ({
      ads: [
        { id: 1, title: 'PRO Analysis', subtitle: '프리미엄 분석 서비스', type: 'gradient', color: 'from-blue-600 to-purple-600', link: '/shop', active: true },
        { id: 2, title: 'AD SPACE', subtitle: '광고 문의', type: 'placeholder', color: 'bg-gray-200 dark:bg-gray-700', active: true },
      ],
      setAds: (ads) => set({ ads }),
      addAd: (ad) => set((state) => ({ ads: [...state.ads, { ...ad, id: Date.now() }] })),
      updateAd: (id, data) => set((state) => ({ ads: state.ads.map(a => a.id === id ? { ...a, ...data } : a) })),
      removeAd: (id) => set((state) => ({ ads: state.ads.filter(a => a.id !== id) })),
    }),
    { name: 'ads-storage' }
  )
);
