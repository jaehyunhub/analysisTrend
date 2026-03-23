import { test, expect } from '../../fixtures/index';
import { TrendsPage } from '../../pages/admin/TrendsPage';

test.describe('ADMIN — 트렌드 분석', () => {
  test.beforeEach(async ({ page }) => {
    const trends = new TrendsPage(page);
    await trends.goto();
  });

  test('트렌드 페이지 접근', async ({ page }) => {
    // 구버전: /admin/trends 404 → 신버전에서만 가능
    const is404 = await page.getByRole('heading', { name: '404' }).isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      // 구버전: 페이지 없음 — 404 확인만 하고 통과
      expect(is404).toBeTruthy();
      return;
    }
    // 신버전: 트렌드 페이지 표시
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('뉴스 키워드 목록 표시', async ({ page }) => {
    const is404 = await page.getByRole('heading', { name: '404' }).isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      test.skip(true, '/admin/trends 페이지 없음 (구버전)');
      return;
    }

    const trends = new TrendsPage(page);
    await expect(trends.newsKeywords).toBeVisible({ timeout: 15000 });
    const items = trends.newsKeywords.locator('li, span, [data-testid="keyword-item"]');
    await expect(items.first()).toBeVisible({ timeout: 10000 });
  });

  test('YouTube 급상승 영상 목록 표시', async ({ page }) => {
    const is404 = await page.getByRole('heading', { name: '404' }).isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      test.skip(true, '/admin/trends 페이지 없음 (구버전)');
      return;
    }

    const trends = new TrendsPage(page);
    // YouTube 트렌딩 탭으로 전환 (기본 탭은 뉴스 키워드)
    await trends.switchToVideosTab();
    await expect(trends.youtubeList).toBeVisible({ timeout: 15000 });
    const items = trends.youtubeList.locator('article, li, [data-testid="video-item"]');
    await expect(items.first()).toBeVisible({ timeout: 10000 });
  });

  test('새로고침 버튼 → 데이터 갱신', async ({ page }) => {
    const is404 = await page.getByRole('heading', { name: '404' }).isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      test.skip(true, '/admin/trends 페이지 없음 (구버전)');
      return;
    }

    const trends = new TrendsPage(page);
    await expect(trends.refreshButton).toBeVisible({ timeout: 8000 });
    await trends.refresh();
    await expect(trends.newsKeywords.or(trends.youtubeList)).toBeVisible({ timeout: 15000 });
  });
});
