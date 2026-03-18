import { Page, Locator } from '@playwright/test';

/**
 * 배너 관리 Page Object
 * ADM-01: 배너 CRUD + 활성/비활성 토글
 */
export class BannerPage {
  readonly page: Page;

  readonly addButton: Locator;
  readonly bannerList: Locator;
  readonly titleInput: Locator;
  readonly linkInput: Locator;
  readonly saveButton: Locator;
  readonly toggleButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addButton = page.getByRole('button', { name: /배너 추가|추가/ });
    this.bannerList = page.locator('[data-testid="banner-list"]');
    this.titleInput = page.getByLabel('제목').or(page.getByPlaceholder('배너 제목'));
    this.linkInput = page.getByLabel('링크').or(page.getByPlaceholder('URL'));
    this.saveButton = page.getByRole('button', { name: /저장|등록/ });
    this.toggleButton = page.getByRole('button', { name: /활성|비활성|토글/ });
    this.deleteButton = page.getByRole('button', { name: /삭제/ });
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/banner');
    await this.page.waitForLoadState('networkidle');
  }

  getBannerByTitle(title: string): Locator {
    return this.bannerList.getByText(title);
  }
}
