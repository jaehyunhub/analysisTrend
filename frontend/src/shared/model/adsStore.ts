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
      ads: [],
      setAds: (ads) => set({ ads }),
      addAd: (ad) => set((state) => ({ ads: [...state.ads, { ...ad, id: Date.now() }] })),
      updateAd: (id, data) => set((state) => ({ ads: state.ads.map(a => a.id === id ? { ...a, ...data } : a) })),
      removeAd: (id) => set((state) => ({ ads: state.ads.filter(a => a.id !== id) })),
    }),
    { name: 'ads-storage-v2' }
  )
);
