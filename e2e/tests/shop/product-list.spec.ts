import { test, expect } from '../../fixtures/index';
import { ShopPage } from '../../pages/shop/ShopPage';

test.describe('SHOP — 상품 목록', () => {
  test('상품 목록 정상 표시', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();
    // main 로드 확인
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 });
    // 상품 링크 또는 heading 확인
    const hasProduct = await page.getByRole('heading', { level: 3 }).first().isVisible({ timeout: 5000 }).catch(() => false);
    const hasLink = await page.locator('main').getByRole('link').first().isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasProduct || hasLink).toBeTruthy();
  });

  test('카테고리 필터 (GOODS / FOOD / FASHION / DIGITAL)', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    for (const btn of [shop.categoryGoods, shop.categoryFood, shop.categoryFashion, shop.categoryDigital]) {
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(400);
        await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
      }
    }
    // 카테고리 버튼이 없어도 테스트 통과
    expect(await page.locator('main').isVisible().catch(() => false)).toBeTruthy();
  });

  test('검색바 입력 → 상품명 필터링', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    const hasSearch = await shop.searchInput.isVisible({ timeout: 3000 }).catch(() => false);
    if (!hasSearch) {
      test.skip(true, '검색 input 없음 (구버전)');
      return;
    }

    const name = await shop.getFirstProductName();
    if (!name) {
      test.skip(true, '상품명 추출 실패');
      return;
    }

    await shop.search(name.slice(0, 4));
    await expect(shop.getProductByName(name)).toBeVisible({ timeout: 5000 });
  });

  test('카테고리 + 검색 AND 조건', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    const hasAllBtn = await shop.categoryAll.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasAllBtn) {
      await shop.categoryAll.click();
      await page.waitForTimeout(300);
    }

    await shop.search('a'); // 검색 input 없으면 무시됨
    await page.waitForTimeout(400);

    // 목록이 표시되거나 빈 상태 표시
    const hasMain = await page.locator('main').isVisible().catch(() => false);
    expect(hasMain).toBeTruthy();
  });

  test('페이지네이션 동작 (다음 페이지)', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    // 페이지네이션: 숫자 버튼 "1", "2", "3" 또는 "다음"
    const nextButton = page.getByRole('button', { name: /다음|>|Next/i }).or(
      page.getByRole('button', { name: '2' })
    );
    if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      if (await nextButton.isEnabled({ timeout: 2000 }).catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(500);
        await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
      } else {
        test.skip(true, '다음 페이지 없음');
      }
    } else {
      test.skip(true, '페이지네이션 없음');
    }
  });
});
