import { Page, Locator } from '@playwright/test';

/**
 * 쇼핑 페이지 Page Object
 * SHOP-01: 목록, 카테고리 필터, 검색바
 */
export class ShopPage {
  readonly page: Page;

  readonly searchInput: Locator;
  readonly productList: Locator;
  readonly categoryAll: Locator;
  readonly categoryGoods: Locator;
  readonly categoryFood: Locator;
  readonly categoryFashion: Locator;
  readonly categoryDigital: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder('상품 검색');
    this.productList = page.locator('[data-testid="product-list"]');
    this.categoryAll = page.getByRole('button', { name: '전체' });
    this.categoryGoods = page.getByRole('button', { name: /굿즈|GOODS/i });
    this.categoryFood = page.getByRole('button', { name: /식품|FOOD/i });
    this.categoryFashion = page.getByRole('button', { name: /패션|FASHION/i });
    this.categoryDigital = page.getByRole('button', { name: /디지털|DIGITAL/i });
    this.pagination = page.locator('[data-testid="pagination"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/shop');
    await this.page.waitForLoadState('networkidle');
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(400); // 디바운스 300ms 대기
  }

  getProductByName(name: string): Locator {
    return this.productList.getByText(name);
  }
}
