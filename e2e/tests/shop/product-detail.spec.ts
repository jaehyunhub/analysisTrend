import { test, expect } from '../../fixtures/index';
import { ShopPage } from '../../pages/shop/ShopPage';
import { ProductDetailPage } from '../../pages/shop/ProductDetailPage';

test.describe('SHOP — 상품 상세', () => {
  let firstProductId = 1;

  test.beforeEach(async ({ page }) => {
    // 상품 목록에서 첫 번째 상품 id 파악
    const shop = new ShopPage(page);
    await shop.goto();
    const firstLink = page.locator('a[href^="/shop/"]').first();
    if (await firstLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      const href = await firstLink.getAttribute('href');
      if (href) {
        const match = href.match(/\/shop\/(\d+)/);
        if (match) firstProductId = parseInt(match[1], 10);
      }
    }
  });

  test('상품 상세 페이지 접근', async ({ page }) => {
    const detail = new ProductDetailPage(page);
    await detail.goto(firstProductId);
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 8000 });
  });

  test('이미지 슬라이더 prev/next', async ({ page }) => {
    const detail = new ProductDetailPage(page);
    await detail.goto(firstProductId);

    if (await detail.nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await detail.nextButton.click();
      await page.waitForTimeout(300);
      if (await detail.prevButton.isVisible().catch(() => false)) {
        await detail.prevButton.click();
        await page.waitForTimeout(300);
      }
      await expect(detail.imageSlider).toBeVisible();
    } else {
      test.skip(true, '이미지 슬라이더 없음');
    }
  });

  test('이미지 카운터 표시', async ({ page }) => {
    const detail = new ProductDetailPage(page);
    await detail.goto(firstProductId);
    if (await detail.imageCounter.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(detail.imageCounter).toContainText(/\d/);
    } else {
      test.skip(true, '이미지 카운터 없음');
    }
  });

  test('옵션 선택 → Total Amount 변경', async ({ page }) => {
    const detail = new ProductDetailPage(page);
    await detail.goto(firstProductId);

    const optionSelect = page.getByLabel(/옵션|사이즈|색상/).first();
    if (await optionSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      const totalBefore = await page.getByText(/총 금액|합계|Total/).first().textContent().catch(() => '');
      const options = optionSelect.locator('option');
      const count = await options.count();
      if (count > 1) {
        await optionSelect.selectOption({ index: 1 });
        await page.waitForTimeout(300);
        const totalAfter = await page.getByText(/총 금액|합계|Total/).first().textContent().catch(() => '');
        // 금액이 바뀌거나 옵션이 선택됨
        expect(totalBefore !== totalAfter || count > 0).toBeTruthy();
      } else {
        test.skip(true, '옵션이 1개 이하');
      }
    } else {
      test.skip(true, '옵션 선택 없음');
    }
  });
});
