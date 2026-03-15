import { create } from 'zustand';
import type { Post, Comment } from '../types/post';
import { MOCK_POSTS } from '../mocks/posts';

type SortType = 'best' | 'hot' | 'new' | 'top';

interface CommunityState {
  posts: Post[];
  selectedFilter: SortType;
  isLoading: boolean;
}

interface CommunityActions {
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  votePost: (postId: number, type: 'up' | 'down') => void;
  addComment: (postId: number, comment: Comment) => void;
  setFilter: (filter: SortType) => void;
  getSortedPosts: () => Post[];
}

export const useCommunityStore = create<CommunityState & CommunityActions>((set, get) => ({
  posts: MOCK_POSTS,
  selectedFilter: 'new',
  isLoading: false,

  setPosts: (posts) => set({ posts }),

  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),

  votePost: (postId, type) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              upvotes: type === 'up' ? p.upvotes + 1 : p.upvotes,
              downvotes: type === 'down' ? p.downvotes + 1 : p.downvotes,
            }
          : p
      ),
    })),

  addComment: (postId, _comment) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
      ),
    })),

  setFilter: (filter) => set({ selectedFilter: filter }),

  getSortedPosts: () => {
    const { posts, selectedFilter } = get();
    switch (selectedFilter) {
      case 'best':
      case 'top':
        return [...posts].sort((a, b) => b.upvotes - a.upvotes);
      case 'hot':
        return [...posts].sort(
          (a, b) => b.upvotes + b.downvotes - (a.upvotes + a.downvotes)
        );
      case 'new':
      default:
        return [...posts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  },
}));
