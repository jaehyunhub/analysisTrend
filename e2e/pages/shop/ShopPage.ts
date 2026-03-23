import { Page, Locator } from '@playwright/test';

/**
 * 쇼핑 페이지 Page Object
 * SHOP-01: 목록, 카테고리 필터, 검색바
 */
export class ShopPage {
  readonly page: Page;

  readonly searchInput: Locator;
  /** 상품 목록 컨테이너 (구버전: data-testid 없음, main 사용) */
  readonly productList: Locator;
  readonly categoryAll: Locator;
  readonly categoryGoods: Locator;
  readonly categoryFood: Locator;
  readonly categoryFashion: Locator;
  readonly categoryDigital: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    this.page = page;
    // 구버전 shop: 검색 input 없을 수 있음
    this.searchInput = page.getByPlaceholder(/상품 검색|search/i).or(
      page.getByRole('searchbox').first()
    );
    // 상품 목록: data-testid 없으므로 main 내 상품 링크들의 부모
    this.productList = page.locator('[data-testid="product-list"]').or(
      page.locator('main')
    );
    // 구버전: ALL / 신버전: 전체
    this.categoryAll = page.getByRole('button', { name: /^ALL$|^전체$/ });
    this.categoryGoods = page.getByRole('button', { name: /GOODS|굿즈/i });
    this.categoryFood = page.getByRole('button', { name: /FOOD|식품/i });
    this.categoryFashion = page.getByRole('button', { name: /FASHION|패션/i });
    this.categoryDigital = page.getByRole('button', { name: /DIGITAL|디지털/i });
    this.pagination = page.locator('[data-testid="pagination"]').or(
      page.getByRole('navigation').filter({ has: page.getByRole('button') }).last()
    );
  }

  async goto(): Promise<void> {
    await this.page.goto('/shop');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(300);
  }

  async search(keyword: string): Promise<void> {
    const visible = await this.searchInput.isVisible({ timeout: 2000 }).catch(() => false);
    if (visible) {
      await this.searchInput.fill(keyword);
      await this.page.waitForTimeout(400); // 디바운스 300ms 대기
    }
  }

  getProductByName(name: string): Locator {
    return this.page.getByText(name, { exact: false });
  }

  /** 첫 번째 상품 제목 반환 */
  async getFirstProductName(): Promise<string | null> {
    const link = this.page.locator('main').getByRole('link').first();
    const heading = link.getByRole('heading').first();
    return heading.textContent().catch(() => null);
  }
}
