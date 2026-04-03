import { apiGet, apiPost, POSTS } from '../../../shared/api';
import type { Post } from '../../../shared/types';

export const postApi = {
  getPosts: (page = 0, sort = 'new') => {
    return apiGet<Post[]>(`${POSTS.LIST}?page=${page}&sort=${sort}`);
  },
  getPostById: (id: number) => {
    return apiGet<Post>(POSTS.DETAIL(id));
  },
  createPost: (title: string, content: string, communityId?: number) => {
    return apiPost<Post>(POSTS.LIST, { title, content, communityId });
  },
  votePost: (id: number, type: 'UP' | 'DOWN') => {
    return apiPost<Post>(`${POSTS.VOTE(id)}?type=${type}`);
  },
  addComment: (postId: number, content: string, parentCommentId?: number) => {
    return apiPost(`${POSTS.COMMENTS(postId)}`, { content, parentCommentId });
  },
};
