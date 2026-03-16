export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  authorAvatar?: string;
  community: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: string;
  tags?: string[];
}

export interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  parentId?: number;
}

export type VoteType = 'UP' | 'DOWN';
