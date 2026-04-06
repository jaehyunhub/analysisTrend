import { useCommunityStore } from '@/shared/model/communityStore';
import type { Post } from '@/shared/types/post';

const makePost = (overrides: Partial<Post> = {}): Post => ({
  id: Date.now(),
  title: '테스트 게시물',
  content: '내용',
  author: 'tester',
  community: 'free',
  upvotes: 0,
  downvotes: 0,
  commentCount: 0,
  createdAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(() => {
  useCommunityStore.setState({
    posts: [],
    selectedFilter: 'new',
    isLoading: false,
    votedPosts: {},
  });
});

describe('communityStore', () => {
  test('addPost: 새 게시물을 목록 앞에 추가', () => {
    const post1 = makePost({ id: 1, title: '첫 번째' });
    const post2 = makePost({ id: 2, title: '두 번째' });
    useCommunityStore.getState().addPost(post1);
    useCommunityStore.getState().addPost(post2);
    const posts = useCommunityStore.getState().posts;
    expect(posts[0].id).toBe(2);
    expect(posts[1].id).toBe(1);
  });

  test('votePost: 업보트 +1', () => {
    useCommunityStore.setState({ posts: [makePost({ id: 10, upvotes: 5, downvotes: 2 })] });
    useCommunityStore.getState().votePost(10, 'up');
    expect(useCommunityStore.getState().posts[0].upvotes).toBe(6);
    expect(useCommunityStore.getState().posts[0].downvotes).toBe(2);
  });

  test('votePost: 다운보트 +1', () => {
    useCommunityStore.setState({ posts: [makePost({ id: 10, upvotes: 5, downvotes: 2 })] });
    useCommunityStore.getState().votePost(10, 'down');
    expect(useCommunityStore.getState().posts[0].downvotes).toBe(3);
    expect(useCommunityStore.getState().posts[0].upvotes).toBe(5);
  });

  test('addComment: commentCount 증가', () => {
    useCommunityStore.setState({ posts: [makePost({ id: 5, commentCount: 3 })] });
    useCommunityStore.getState().addComment(5, {
      id: 1,
      content: '댓글',
      author: 'user',
      createdAt: new Date().toISOString(),
    });
    expect(useCommunityStore.getState().posts[0].commentCount).toBe(4);
  });

  test('setFilter: 필터 변경', () => {
    useCommunityStore.getState().setFilter('hot');
    expect(useCommunityStore.getState().selectedFilter).toBe('hot');
  });

  test('getSortedPosts: new 필터는 최신순 정렬', () => {
    const posts = [
      makePost({ id: 1, createdAt: '2025-01-01T00:00:00Z' }),
      makePost({ id: 2, createdAt: '2025-03-01T00:00:00Z' }),
      makePost({ id: 3, createdAt: '2025-02-01T00:00:00Z' }),
    ];
    useCommunityStore.setState({ posts, selectedFilter: 'new' });
    const sorted = useCommunityStore.getState().getSortedPosts();
    expect(sorted[0].id).toBe(2);
  });

  test('getSortedPosts: top 필터는 업보트 내림차순', () => {
    const posts = [
      makePost({ id: 1, upvotes: 10 }),
      makePost({ id: 2, upvotes: 50 }),
      makePost({ id: 3, upvotes: 25 }),
    ];
    useCommunityStore.setState({ posts, selectedFilter: 'top' });
    const sorted = useCommunityStore.getState().getSortedPosts();
    expect(sorted[0].id).toBe(2);
    expect(sorted[1].id).toBe(3);
  });
});
