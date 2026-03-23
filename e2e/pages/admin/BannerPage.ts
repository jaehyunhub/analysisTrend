import { Page, Locator } from '@playwright/test';

/**
 * 배너 관리 Page Object
 * ADM-01: 배너 CRUD + 활성/비활성 토글
 */
export class BannerPage {
  readonly page: Page;

  readonly addButton: Locator;
  /** 배너 목록 컨테이너 */
  readonly bannerList: Locator;
  readonly titleInput: Locator;
  readonly linkInput: Locator;
  readonly saveButton: Locator;
  readonly toggleButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // 구버전: "+ Add Banner", 신버전: "배너 추가" 등
    this.addButton = page.getByRole('button', { name: /Add Banner|배너 추가|\+ Add/i });
    // 배너 목록: data-testid 없으면 main 사용
    this.bannerList = page.locator('[data-testid="banner-list"]').or(page.locator('main'));
    this.titleInput = page.getByLabel(/제목|Title/i).or(page.getByPlaceholder(/배너 제목|Banner Title/i));
    this.linkInput = page.getByLabel(/링크|Link|URL/i).or(page.getByPlaceholder(/URL|링크|Link/i));
    this.saveButton = page.getByRole('button', { name: /저장|등록|Save|Submit/i });
    // 활성 토글: "Active"/"Draft" 또는 아이콘 버튼
    this.toggleButton = page.getByRole('button', { name: /Active|Draft|활성|비활성|토글/i }).or(
      page.locator('[data-testid="banner-toggle"]')
    );
    this.deleteButton = page.getByRole('button', { name: /삭제|Delete/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/banner');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(300);
  }

  getBannerByTitle(title: string): Locator {
    return this.page.getByText(title, { exact: false });
  }

  /** Add Banner 클릭 후 폼/다이얼로그 반환 여부 */
  async clickAddAndWaitForForm(): Promise<boolean> {
    await this.addButton.click();
    const form = this.page.getByRole('dialog').or(
      this.page.locator('form').filter({ has: this.page.getByRole('textbox') })
    );
    return form.waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
  }
}
