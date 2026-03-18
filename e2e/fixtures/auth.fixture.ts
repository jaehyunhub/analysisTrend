import { test as base, Page } from '@playwright/test';
import { LoginModal } from '../pages/auth/LoginModal';

/**
 * 인증 픽스처
 * storageState로 매 테스트마다 로그인 반복 없이 인증 상태를 주입합니다.
 *
 * 사용 예:
 *   import { test } from '@fixtures/index';
 *   test('게시글 작성', async ({ userPage }) => { ... });
 */

type AuthFixtures = {
  loginModal: LoginModal;
};

export const authTest = base.extend<AuthFixtures>({
  loginModal: async ({ page }, use) => {
    await use(new LoginModal(page));
  },
});

/** 로그인 후 토큰을 localStorage에 직접 주입하는 헬퍼 (빠른 인증용) */
export async function injectTokens(
  page: Page,
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await page.evaluate(
    ({ at, rt }) => {
      localStorage.setItem('accessToken', at);
      localStorage.setItem('refreshToken', rt);
    },
    { at: accessToken, rt: refreshToken },
  );
}
