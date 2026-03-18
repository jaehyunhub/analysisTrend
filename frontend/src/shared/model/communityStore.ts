import { create } from 'zustand';
import type { Post, Comment } from '../types/post';
import { MOCK_POSTS } from '../mocks/posts';
import { USE_MOCK_API } from '../api/mock/config';
import { apiGet, apiPost } from '../api/client';

type SortType = 'best' | 'hot' | 'new' | 'top';

interface CommunityState {
  posts: Post[];
  selectedFilter: SortType;
  isLoading: boolean;
}

interface CommunityActions {
  fetchPosts: () => Promise<void>;
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  addPostWithApi: (title: string, content: string, communityId?: number) => Promise<Post>;
  votePost: (postId: number, type: 'up' | 'down') => void;
  votePostWithApi: (postId: number, type: 'up' | 'down') => Promise<void>;
  addComment: (postId: number, comment: Comment) => Promise<void>;
  setFilter: (filter: SortType) => void;
  getSortedPosts: () => Post[];
}

export const useCommunityStore = create<CommunityState & CommunityActions>((set, get) => ({
  posts: MOCK_POSTS,
  selectedFilter: 'new',
  isLoading: false,

  // API 또는 mock에서 게시물 목록 로드
  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      if (USE_MOCK_API) {
        set({ posts: MOCK_POSTS });
        return;
      }
      const data = await apiGet<{ content: Post[]; totalElements: number }>(
        '/api/v1/posts?page=0&size=50'
      );
      set({ posts: data.content ?? [] });
    } catch {
      // API 실패 시 mock 데이터로 fallback
      set({ posts: MOCK_POSTS });
    } finally {
      set({ isLoading: false });
    }
  },

  setPosts: (posts) => set({ posts }),

  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),

  // API 게시물 작성 (USE_MOCK_API false 시 실제 API 호출)
  addPostWithApi: async (title, content, communityId) => {
    if (USE_MOCK_API) {
      const newPost: Post = {
        id: Date.now(),
        title,
        content,
        author: '나',
        upvotes: 0,
        downvotes: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        community: 'free',
      };
      set((state) => ({ posts: [newPost, ...state.posts] }));
      return newPost;
    }

    const created = await apiPost<Post>('/api/v1/posts', {
      title,
      content,
      communityId: communityId ?? null,
    });
    set((state) => ({ posts: [created, ...state.posts] }));
    return created;
  },

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

  // API 투표 (낙관적 업데이트 + API 동기화)
  votePostWithApi: async (postId, type) => {
    // 낙관적 업데이트
    get().votePost(postId, type);

    if (!USE_MOCK_API) {
      try {
        await apiPost(`/api/v1/posts/${postId}/vote`, {
          voteType: type.toUpperCase(),
        });
      } catch {
        // 실패 시 롤백
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  upvotes: type === 'up' ? p.upvotes - 1 : p.upvotes,
                  downvotes: type === 'down' ? p.downvotes - 1 : p.downvotes,
                }
              : p
          ),
        }));
      }
    }
  },

  addComment: async (postId, comment) => {
    // 낙관적 업데이트
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
      ),
    }));

    if (!USE_MOCK_API) {
      try {
        await apiPost(`/api/v1/posts/${postId}/comments`, {
          content: comment.content,
        });
      } catch {
        // 실패 시 commentCount 롤백
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, commentCount: Math.max((p.commentCount || 1) - 1, 0) } : p
          ),
        }));
      }
    }
  },

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
