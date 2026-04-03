import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Post, Comment } from '../types/post';
import { apiGet, apiPost, apiDelete } from '../api/client';

type SortType = 'best' | 'hot' | 'new' | 'top';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
function weekKey(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

interface CommunityState {
  posts: Post[];
  selectedFilter: SortType;
  isLoading: boolean;
  joinedCommunities: string[];
  memberCounts: Record<string, number>;
  dailyVisitorLog: Record<string, Record<string, number>>;
  weeklyVisitorLog: Record<string, Record<string, number>>;
  votedPosts: Record<number, 'up' | 'down' | null>;
}

interface CommunityActions {
  fetchPosts: () => Promise<void>;
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  addPostWithApi: (title: string, content: string, communityId?: number) => Promise<Post>;
  votePost: (postId: number, type: 'up' | 'down') => void;
  votePostWithApi: (postId: number, type: 'up' | 'down') => Promise<void>;
  getVoteState: (postId: number) => 'up' | 'down' | null;
  addComment: (postId: number, comment: Comment) => Promise<void>;
  setFilter: (filter: SortType) => void;
  getSortedPosts: () => Post[];
  deletePostWithApi: (postId: number) => Promise<void>;
  joinCommunity: (communityName: string) => void;
  leaveCommunity: (communityName: string) => void;
  isMember: (communityName: string) => boolean;
  incrementMember: (communityName: string) => void;
  decrementMember: (communityName: string) => void;
  getMemberCount: (communityName: string) => number;
  recordVisit: (communityName: string) => void;
  getDailyVisitors: (communityName: string) => number;
  getWeeklyVisitors: (communityName: string) => number;
}

export const useCommunityStore = create<CommunityState & CommunityActions>()(
  persist(
    (set, get) => ({
      posts: [],
      selectedFilter: 'new',
      isLoading: false,
      joinedCommunities: [],
      memberCounts: {},
      dailyVisitorLog: {},
      weeklyVisitorLog: {},
      votedPosts: {},

      fetchPosts: async () => {
        set({ isLoading: true });
        try {
          const data = await apiGet<{ content: Record<string, unknown>[]; totalElements: number }>(
            '/api/v1/posts?page=0&size=50'
          );
          const mapped: Post[] = (data.content ?? []).map((p) => ({
            id: p.id as number,
            title: p.title as string,
            content: p.content as string,
            author: (p.authorNickname ?? p.author) as string,
            community: ((p.communityName ?? p.community) ?? '') as string,
            upvotes: (p.upvotes ?? 0) as number,
            downvotes: (p.downvotes ?? 0) as number,
            commentCount: (p.commentCount ?? 0) as number,
            createdAt: p.createdAt as string,
          }));
          set({ posts: mapped });
        } catch {
          set({ posts: [] });
        } finally {
          set({ isLoading: false });
        }
      },

      setPosts: (posts) => set({ posts }),

      addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),

      addPostWithApi: async (title, content, communityId) => {
        const created = await apiPost<Post>('/api/v1/posts', {
          title,
          content,
          communityId: communityId ?? null,
        });
        set((state) => ({ posts: [created, ...state.posts] }));
        return created;
      },

      votePost: (postId, type) =>
        set((state) => {
          const currentVote = state.votedPosts[postId] ?? null;

          const updatedPosts = state.posts.map((p) => {
            if (p.id !== postId) return p;
            if (currentVote === type) {
              // 동일 방향 재클릭 → 취소
              return {
                ...p,
                upvotes: type === 'up' ? p.upvotes - 1 : p.upvotes,
                downvotes: type === 'down' ? p.downvotes - 1 : p.downvotes,
              };
            } else if (currentVote !== null) {
              // 반대 방향 → 기존 취소 + 새 방향 추가
              return {
                ...p,
                upvotes:
                  currentVote === 'up'
                    ? p.upvotes - 1
                    : type === 'up'
                    ? p.upvotes + 1
                    : p.upvotes,
                downvotes:
                  currentVote === 'down'
                    ? p.downvotes - 1
                    : type === 'down'
                    ? p.downvotes + 1
                    : p.downvotes,
              };
            } else {
              // 새 투표
              return {
                ...p,
                upvotes: type === 'up' ? p.upvotes + 1 : p.upvotes,
                downvotes: type === 'down' ? p.downvotes + 1 : p.downvotes,
              };
            }
          });

          const newVote = currentVote === type ? null : type;
          return {
            posts: updatedPosts,
            votedPosts: { ...state.votedPosts, [postId]: newVote },
          };
        }),

      votePostWithApi: async (postId, type) => {
        const prevVote = get().votedPosts[postId] ?? null;
        const prevPost = get().posts.find((p) => p.id === postId);
        get().votePost(postId, type);

        try {
          await apiPost(`/api/v1/posts/${postId}/vote`, {
            voteType: type.toUpperCase(),
          });
        } catch {
          // 실패 시 롤백
          if (prevPost) {
            set((state) => ({
              posts: state.posts.map((p) =>
                p.id === postId
                  ? { ...p, upvotes: prevPost.upvotes, downvotes: prevPost.downvotes }
                  : p
              ),
              votedPosts: { ...state.votedPosts, [postId]: prevVote },
            }));
          }
        }
      },

      getVoteState: (postId) => get().votedPosts[postId] ?? null,

      addComment: async (postId, comment) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
          ),
        }));
        try {
          await apiPost(`/api/v1/posts/${postId}/comments`, {
            content: comment.content,
          });
        } catch {
          set((state) => ({
            posts: state.posts.map((p) =>
              p.id === postId ? { ...p, commentCount: Math.max((p.commentCount || 1) - 1, 0) } : p
            ),
          }));
        }
      },

      deletePostWithApi: async (postId) => {
        try {
          await apiDelete(`/api/v1/posts/${postId}`);
          set((state) => ({ posts: state.posts.filter((p) => p.id !== postId) }));
        } catch {
          // 에러는 client.ts에서 toast로 처리됨
        }
      },

      setFilter: (filter) => set({ selectedFilter: filter }),

      joinCommunity: (communityName) =>
        set((state) => ({
          joinedCommunities: state.joinedCommunities.includes(communityName)
            ? state.joinedCommunities
            : [...state.joinedCommunities, communityName],
        })),

      leaveCommunity: (communityName) =>
        set((state) => ({
          joinedCommunities: state.joinedCommunities.filter((c) => c !== communityName),
        })),

      isMember: (communityName) => get().joinedCommunities.includes(communityName),

      incrementMember: (communityName) =>
        set((state) => ({
          memberCounts: {
            ...state.memberCounts,
            [communityName]: (state.memberCounts[communityName] ?? 0) + 1,
          },
        })),

      decrementMember: (communityName) =>
        set((state) => ({
          memberCounts: {
            ...state.memberCounts,
            [communityName]: Math.max((state.memberCounts[communityName] ?? 1) - 1, 0),
          },
        })),

      getMemberCount: (communityName) => get().memberCounts[communityName] ?? 0,

      recordVisit: (communityName) => {
        const today = todayKey();
        const week = weekKey();
        set((state) => {
          const daily = { ...state.dailyVisitorLog };
          if (!daily[communityName]) daily[communityName] = {};
          daily[communityName] = {
            ...daily[communityName],
            [today]: (daily[communityName][today] ?? 0) + 1,
          };

          const weekly = { ...state.weeklyVisitorLog };
          if (!weekly[communityName]) weekly[communityName] = {};
          weekly[communityName] = {
            ...weekly[communityName],
            [week]: (weekly[communityName][week] ?? 0) + 1,
          };

          return { dailyVisitorLog: daily, weeklyVisitorLog: weekly };
        });
      },

      getDailyVisitors: (communityName) => {
        const today = todayKey();
        return get().dailyVisitorLog[communityName]?.[today] ?? 0;
      },

      getWeeklyVisitors: (communityName) => {
        const week = weekKey();
        return get().weeklyVisitorLog[communityName]?.[week] ?? 0;
      },

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
    }),
    {
      name: 'community-storage',
      partialize: (state) => ({
        joinedCommunities: state.joinedCommunities,
        memberCounts: state.memberCounts,
        dailyVisitorLog: state.dailyVisitorLog,
        weeklyVisitorLog: state.weeklyVisitorLog,
        votedPosts: state.votedPosts,
      }),
    }
  )
);
