import { test as base } from '@playwright/test';
import { ApiHelper } from '../helpers/api';

/**
 * 커뮤니티 픽스처
 * 테스트용 게시글을 생성하고, 테스트 완료 후 자동 삭제합니다.
 */

type CommunityFixtures = {
  testPost: { id: number; title: string; content: string };
};

export const communityTest = base.extend<CommunityFixtures>({
  testPost: async ({}, use) => {
    const api = new ApiHelper(process.env.BASE_URL || 'http://localhost');
    const { accessToken } = await api.login(
      process.env.TEST_USER_EMAIL || 'testuser@e2e.com',
      process.env.TEST_USER_PASSWORD || 'Test1234!',
    );

    const post = await api.createPost(accessToken, {
      title: '[E2E 테스트] 자동 생성 게시글',
      content: 'E2E 테스트를 위해 자동 생성된 게시글입니다.',
      communityId: 1,
    }) as { data: { id: number; title: string; content: string } };

    // 테스트에 픽스처 제공
    await use(post.data);

    // teardown: 테스트 완료 후 삭제
    await api.deletePost(accessToken, post.data.id).catch(() => {});
  },
});
