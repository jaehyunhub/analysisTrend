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

const INITIAL_QNA: QnaItem[] = [];

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
      name: 'shop-qna-storage-v2',
      merge: (persisted, current) => {
        const p = persisted as Partial<QnaState & QnaActions> | undefined;
        if (!p || !p.qnaList || p.qnaList.length === 0) return { ...current };
        return { ...current, ...p };
      },
    }
  )
);
