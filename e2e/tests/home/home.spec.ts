import { test, expect } from '../../fixtures/index';
import { HomePage } from '../../pages/HomePage';

test.describe('HOME — 홈 대시보드', () => {
  test('홈 페이지 정상 로드 (HTTP 200)', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
  });

  test('Hero 배너 표시', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.banner).toBeVisible({ timeout: 8000 });
  });

  test('YouTube 영상 그리드 표시', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.videoGrid).toBeVisible({ timeout: 8000 });
    const videos = home.videoGrid.locator('article, [data-testid="video-card"], li');
    await expect(videos.first()).toBeVisible({ timeout: 8000 });
  });

  test('방송 일정 위젯 표시', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.scheduleWidget).toBeVisible({ timeout: 8000 });
  });

  test('비로그인 상태에서 홈 접근 가능', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    // 로그인 버튼이 표시되어야 함
    await expect(page.getByRole('button', { name: /^(로그인|Log In)$/i })).toBeVisible({ timeout: 5000 });
  });
});
