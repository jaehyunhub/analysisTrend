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

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'review-init-1',
    productName: '슈친상사 제주 흑돈&백돈 모음',
    authorName: '제주러버',
    rating: 5,
    content: '고기 질이 정말 좋습니다! 제주 흑돈 특유의 쫄깃한 식감이 일품이에요. 재구매 의사 100%',
    createdAt: '2026-03-28T18:30:00.000Z',
    isHidden: false,
  },
  {
    id: 'review-init-2',
    productName: '슈친상사 제주 흑돈&백돈 모음',
    authorName: '고기애호가',
    rating: 4,
    content: '맛은 좋은데 양이 좀 적은 느낌이에요. 가격 대비 괜찮습니다.',
    createdAt: '2026-03-27T12:00:00.000Z',
    isHidden: false,
  },
  {
    id: 'review-init-3',
    productName: '슈카친구들 X 오롬 2026년 다이어리 세트',
    authorName: '다이어리수집가',
    rating: 5,
    content: '디자인이 너무 예쁘고 종이 질감도 좋아요. 슈카친구들 굿즈 중 최고!',
    createdAt: '2026-03-26T09:00:00.000Z',
    isHidden: false,
  },
  {
    id: 'review-init-4',
    productName: '슈카친구들 X 오롬 2026년 다이어리 세트',
    authorName: '직장인K',
    rating: 3,
    content: '다이어리는 괜찮은데 펜홀더가 없어서 아쉽습니다.',
    createdAt: '2026-03-25T15:30:00.000Z',
    isHidden: false,
  },
  {
    id: 'review-init-5',
    productName: '지식은 지금 총서 (1~3권 세트)',
    authorName: '경제학도',
    rating: 5,
    content: '슈카월드 영상을 책으로 정리한 느낌. 경제 입문서로 강력 추천합니다.',
    createdAt: '2026-03-29T20:00:00.000Z',
    isHidden: false,
  },
  {
    id: 'review-init-6',
    productName: '지식은 지금 총서 (1~3권 세트)',
    authorName: '독서매니아',
    rating: 4,
    content: '1, 2권은 정말 재밌는데 3권은 약간 어려운 부분이 있어요. 전체적으로 만족!',
    createdAt: '2026-03-24T10:15:00.000Z',
    isHidden: false,
  },
  {
    id: 'review-init-7',
    productName: '슈친상사 제주 흑돈&백돈 모음',
    authorName: '맛평가단',
    rating: 2,
    content: '배송 중 해동되어서 신선도가 떨어졌습니다. 포장 개선이 필요해요.',
    createdAt: '2026-03-23T08:00:00.000Z',
    isHidden: false,
  },
];

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
      name: 'shop-review-storage',
      merge: (persisted, current) => {
        const p = persisted as Partial<ReviewState & ReviewActions> | undefined;
        if (!p || !p.reviews || p.reviews.length === 0) return { ...current };
        return { ...current, ...p };
      },
    }
  )
);
