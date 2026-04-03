import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QnaItem {
  id: string;
  productName: string;
  question: string;
  answer: string;
  authorName: string;
  createdAt: string;
  status: 'pending' | 'answered';
}

interface QnaState {
  qnaList: QnaItem[];
}

interface QnaActions {
  addQna: (item: Omit<QnaItem, 'id' | 'createdAt' | 'status' | 'answer'>) => void;
  answerQna: (id: string, answer: string) => void;
  deleteQna: (id: string) => void;
}

let _idCounter = 0;
const generateId = () => `qna-${++_idCounter}-${Math.random().toString(36).slice(2, 7)}`;

const INITIAL_QNA: QnaItem[] = [
  {
    id: 'qna-init-1',
    productName: '슈친상사 제주 흑돈&백돈 모음',
    question: '배송은 얼마나 걸리나요?',
    answer: '',
    authorName: '구매자A',
    createdAt: '2026-03-28T10:00:00.000Z',
    status: 'pending',
  },
  {
    id: 'qna-init-2',
    productName: '슈친상사 제주 흑돈&백돈 모음',
    question: '냉동 배송인가요?',
    answer: '네, 냉동 택배로 발송됩니다. 수령 후 냉동 보관해 주세요.',
    authorName: '흑돈매니아',
    createdAt: '2026-03-27T14:30:00.000Z',
    status: 'answered',
  },
  {
    id: 'qna-init-3',
    productName: '슈카친구들 X 오롬 2026년 다이어리 세트',
    question: '다이어리 사이즈가 어떻게 되나요?',
    answer: '',
    authorName: '문구덕후',
    createdAt: '2026-03-29T09:15:00.000Z',
    status: 'pending',
  },
  {
    id: 'qna-init-4',
    productName: '슈카친구들 X 오롬 2026년 다이어리 세트',
    question: '재입고 예정이 있을까요?',
    answer: '현재 품절 상태이며 재입고 일정은 미정입니다. 입고 시 공지 드리겠습니다.',
    authorName: '슈카팬',
    createdAt: '2026-03-26T16:00:00.000Z',
    status: 'answered',
  },
  {
    id: 'qna-init-5',
    productName: '지식은 지금 총서 (1~3권 세트)',
    question: '낱권 구매도 가능한가요?',
    answer: '',
    authorName: '독서왕',
    createdAt: '2026-03-30T11:45:00.000Z',
    status: 'pending',
  },
];

export const useShopQnaStore = create<QnaState & QnaActions>()(
  persist(
    (set) => ({
      qnaList: INITIAL_QNA,

      addQna: (item) => {
        const newItem: QnaItem = {
          ...item,
          id: generateId(),
          answer: '',
          createdAt: new Date().toISOString(),
          status: 'pending',
        };
        set((state) => ({ qnaList: [newItem, ...state.qnaList] }));
      },

      answerQna: (id, answer) => {
        set((state) => ({
          qnaList: state.qnaList.map((q) =>
            q.id === id ? { ...q, answer, status: 'answered' as const } : q
          ),
        }));
      },

      deleteQna: (id) => {
        set((state) => ({ qnaList: state.qnaList.filter((q) => q.id !== id) }));
      },
    }),
    {
      name: 'shop-qna-storage',
      merge: (persisted, current) => {
        const p = persisted as Partial<QnaState & QnaActions> | undefined;
        if (!p || !p.qnaList || p.qnaList.length === 0) return { ...current };
        return { ...current, ...p };
      },
    }
  )
);
