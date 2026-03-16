import { apiGet, apiPost, POSTS } from '../../../shared/api';
import { USE_MOCK_API } from '../../../shared/api/mock/config';
import { mockPostApi } from '../../../shared/api/mock/mockApi';
import type { Post } from '../../../shared/types';

export const postApi = {
  getPosts: (page = 0, sort = 'new') => {
    if (USE_MOCK_API) return mockPostApi.getPosts(page, sort);
    return apiGet<Post[]>(`${POSTS.LIST}?page=${page}&sort=${sort}`);
  },
  getPostById: (id: number) => {
    if (USE_MOCK_API) return mockPostApi.getPostById(id);
    return apiGet<Post>(POSTS.DETAIL(id));
  },
  createPost: (title: string, content: string, communityId?: number) => {
    if (USE_MOCK_API) return mockPostApi.createPost(title, content);
    return apiPost<Post>(POSTS.LIST, { title, content, communityId });
  },
  votePost: (id: number, type: 'UP' | 'DOWN') => {
    return apiPost<Post>(`${POSTS.VOTE(id)}?type=${type}`);
  },
  addComment: (postId: number, content: string, parentCommentId?: number) => {
    return apiPost(`${POSTS.COMMENTS(postId)}`, { content, parentCommentId });
  },
};
