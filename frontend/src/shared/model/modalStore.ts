import { create } from 'zustand';

interface ModalState {
  isCreatePostOpen: boolean;
  openCreatePost: () => void;
  closeCreatePost: () => void;

  selectedPostId: number | null;
  openPostDetail: (postId: number) => void;
  closePostDetail: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isCreatePostOpen: false,
  openCreatePost: () => set({ isCreatePostOpen: true }),
  closeCreatePost: () => set({ isCreatePostOpen: false }),

  selectedPostId: null,
  openPostDetail: (postId) => set({ selectedPostId: postId }),
  closePostDetail: () => set({ selectedPostId: null }),
}));
