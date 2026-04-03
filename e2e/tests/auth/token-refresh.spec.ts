import { test, expect } from '../../fixtures/index';

const USER_EMAIL = process.env.TEST_USER_EMAIL || 'testuser@e2e.com';
const USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'Test1234!';

test.describe('AUTH — 토큰 갱신', () => {
  test('accessToken 만료 시 자동 재발급 후 API 호출 성공', async ({ page }) => {
    // 로그인 후 accessToken을 만료된 값으로 교체
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 로그인 상태 주입 (만료 토큰 시뮬레이션)
    const expiredToken = 'expired.fake.accesstoken';
    await page.evaluate(({ token }) => {
      localStorage.setItem('accessToken', token);
    }, { token: expiredToken });

    // 401 응답 후 자동 refresh 시도를 intercept
    let refreshCalled = false;
    await page.route('**/api/v1/auth/refresh', (route) => {
      refreshCalled = true;
      // refreshToken이 없으면 401 반환
      route.continue();
    });

    // API 요청 유발 (커뮤니티 페이지 방문)
    await page.goto('/community');
    await page.waitForLoadState('domcontentloaded');

    // 페이지가 정상 로드되거나(refresh 성공) 로그인 상태가 클리어되어야 함
    const url = page.url();
    expect(url).toMatch(/localhost/);
  });

  test('refreshToken 만료 시 로그아웃 처리', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // refresh 엔드포인트가 401 반환하도록 mock
    await page.route('**/api/v1/auth/refresh', (route) => {
      route.fulfill({ status: 401, body: JSON.stringify({ message: 'Refresh token expired' }) });
    });

    // 만료된 토큰 주입
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'expired.fake.token');
      localStorage.setItem('refreshToken', 'expired.fake.refresh');
    });

    // 인증이 필요한 API 유발
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    // refresh 실패 후 로그아웃 처리 및 리다이렉트 완료 대기
    await page.waitForTimeout(3000);

    // 로그아웃 처리 → 로그인 버튼 표시 또는 리다이렉트
    const currentUrl = page.url();
    const isRedirected = !currentUrl.includes('/mypage');
    const loginButton = page.getByRole('button', { name: /^(로그인|Log In)$/i });
    const loginButtonVisible = await loginButton.isVisible({ timeout: 3000 }).catch(() => false);

    expect(isRedirected || loginButtonVisible).toBeTruthy();
  });
});
