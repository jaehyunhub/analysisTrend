import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MOCK_MAGAZINES } from '@/shared/mocks/magazines';
import type { Magazine } from '@/shared/types/magazine';

interface MagazineStore {
  magazines: Magazine[];
  getMagazine: (id: number) => Magazine | undefined;
  upsert: (article: Magazine) => void;
  remove: (id: number) => void;
}

export const useMagazineStore = create<MagazineStore>()(
  persist(
    (set, get) => ({
      magazines: MOCK_MAGAZINES,

      getMagazine: (id) => get().magazines.find((m) => m.id === id),

      upsert: (article) =>
        set((state) => {
          const exists = state.magazines.some((m) => m.id === article.id);
          return {
            magazines: exists
              ? state.magazines.map((m) => (m.id === article.id ? article : m))
              : [article, ...state.magazines],
          };
        }),

      remove: (id) =>
        set((state) => ({
          magazines: state.magazines.filter((m) => m.id !== id),
        })),
    }),
    {
      name: 'magazine-storage',
      storage: createJSONStorage(() => localStorage),
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<MagazineStore> | null;
        return {
          ...current,
          ...(p ?? {}),
          magazines:
            Array.isArray(p?.magazines) && p.magazines.length > 0
              ? p.magazines
              : MOCK_MAGAZINES,
        };
      },
    },
  ),
);
