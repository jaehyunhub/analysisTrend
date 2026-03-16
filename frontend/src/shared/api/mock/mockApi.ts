import { delay } from './delay';
import { MOCK_POSTS, MOCK_COMMUNITIES, MOCK_PRODUCTS, MOCK_USERS } from '../../mocks';
import type { Post, Community, Product, User } from '../../types';

export const mockAuthApi = {
  login: async (email: string, _password: string): Promise<{ accessToken: string; user: User }> => {
    await delay(600);
    const user = MOCK_USERS.find((u) => u.email === email) ?? MOCK_USERS[0];
    return { accessToken: 'mock-access-token-' + Date.now(), user };
  },
  signup: async (email: string, nickname: string, _password: string): Promise<{ accessToken: string; user: User }> => {
    await delay(800);
    const user: User = {
      id: Date.now(),
      email,
      nickname,
      role: 'USER',
      provider: 'LOCAL',
      createdAt: new Date().toISOString(),
    };
    return { accessToken: 'mock-access-token-' + Date.now(), user };
  },
};

export const mockPostApi = {
  getPosts: async (page = 0, _sort = 'new'): Promise<Post[]> => {
    await delay();
    return MOCK_POSTS.slice(page * 20, (page + 1) * 20);
  },
  getPostById: async (id: number): Promise<Post> => {
    await delay();
    const post = MOCK_POSTS.find((p) => p.id === id);
    if (!post) throw new Error('게시글을 찾을 수 없습니다.');
    return post;
  },
  createPost: async (title: string, content: string): Promise<Post> => {
    await delay(500);
    const newPost: Post = {
      id: Date.now(),
      title,
      content,
      author: '사용자',
      community: '일반',
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };
    return newPost;
  },
};

export const mockCommunityApi = {
  getCommunities: async (): Promise<Community[]> => {
    await delay();
    return MOCK_COMMUNITIES;
  },
};

export const mockProductApi = {
  getProducts: async (page = 0, category?: string): Promise<Product[]> => {
    await delay();
    let filtered = MOCK_PRODUCTS;
    if (category && category !== 'ALL') {
      filtered = MOCK_PRODUCTS.filter((p) => p.category === category);
    }
    return filtered.slice(page * 20, (page + 1) * 20);
  },
};
