import { Page, Locator } from '@playwright/test';

/**
 * 상품 상세 페이지 Page Object
 * SHOP-02: 상세, 이미지 슬라이더, 옵션 선택
 * SHOP-03: 장바구니 추가
 */
export class ProductDetailPage {
  readonly page: Page;

  readonly imageSlider: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;
  readonly imageCounter: Locator;
  /** 구버전: "ADD TO CART", 신버전: "장바구니 담기" */
  readonly addToCartButton: Locator;
  readonly cartToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.imageSlider = page.locator('[data-testid="image-slider"]');
    this.prevButton = page.getByRole('button', { name: /이전|prev/i });
    this.nextButton = page.getByRole('button', { name: /다음|next/i });
    this.imageCounter = page.locator('[data-testid="image-counter"]');
    // 구버전: "ADD TO CART", 신버전: "장바구니 담기"
    this.addToCartButton = page.getByRole('button', { name: /ADD TO CART|장바구니|담기/i });
    this.cartToast = page.getByRole('status').or(page.getByRole('alert')).or(
      page.locator('[data-testid="toast"]')
    );
  }

  async goto(productId: number): Promise<void> {
    await this.page.goto(`/shop/${productId}`);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(300);
  }

  async addToCart(): Promise<void> {
    // 옵션 선택이 필요한 경우 첫 번째 옵션 자동 선택
    const select = this.page.locator('select').first();
    const selectExists = await select.isVisible({ timeout: 1000 }).catch(() => false);
    if (selectExists) {
      await select.selectOption({ index: 1 });
      await this.page.waitForTimeout(200);
    }
    await this.addToCartButton.click();
  }
}
