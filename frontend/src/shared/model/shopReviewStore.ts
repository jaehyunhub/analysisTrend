import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ReviewItem {
  id: string;
  productName: string;
  authorName: string;
  rating: number;
  content: string;
  createdAt: string;
  isHidden: boolean;
}

interface ReviewState {
  reviews: ReviewItem[];
}

interface ReviewActions {
  addReview: (item: Omit<ReviewItem, 'id' | 'createdAt' | 'isHidden'>) => void;
  hideReview: (id: string) => void;
  showReview: (id: string) => void;
  deleteReview: (id: string) => void;
}

let _idCounter = 0;
const generateId = () => `review-${++_idCounter}-${Math.random().toString(36).slice(2, 7)}`;

const INITIAL_REVIEWS: ReviewItem[] = [];

export const useShopReviewStore = create<ReviewState & ReviewActions>()(
  persist(
    (set) => ({
      reviews: INITIAL_REVIEWS,

      addReview: (item) => {
        const newItem: ReviewItem = {
          ...item,
          id: generateId(),
          createdAt: new Date().toISOString(),
          isHidden: false,
        };
        set((state) => ({ reviews: [newItem, ...state.reviews] }));
      },

      hideReview: (id) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id ? { ...r, isHidden: true } : r
          ),
        }));
      },

      showReview: (id) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id ? { ...r, isHidden: false } : r
          ),
        }));
      },

      deleteReview: (id) => {
        set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) }));
      },
    }),
    {
      name: 'shop-review-storage-v2',
      merge: (persisted, current) => {
        const p = persisted as Partial<ReviewState & ReviewActions> | undefined;
        if (!p || !p.reviews || p.reviews.length === 0) return { ...current };
        return { ...current, ...p };
      },
    }
  )
);
