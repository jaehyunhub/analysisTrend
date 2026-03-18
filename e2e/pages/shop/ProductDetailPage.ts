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
  readonly addToCartButton: Locator;
  readonly cartToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.imageSlider = page.locator('[data-testid="image-slider"]');
    this.prevButton = page.getByRole('button', { name: /이전|prev/i });
    this.nextButton = page.getByRole('button', { name: /다음|next/i });
    this.imageCounter = page.locator('[data-testid="image-counter"]');
    this.addToCartButton = page.getByRole('button', { name: /장바구니|담기/ });
    this.cartToast = page.getByRole('status').or(page.locator('[data-testid="toast"]'));
  }

  async goto(productId: number): Promise<void> {
    await this.page.goto(`/shop/${productId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
