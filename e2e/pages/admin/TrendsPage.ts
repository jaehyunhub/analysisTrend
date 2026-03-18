import { Page, Locator } from '@playwright/test';

/**
 * 트렌드 분석 Page Object
 * TRD-01~02: 뉴스 키워드, YouTube 급상승
 */
export class TrendsPage {
  readonly page: Page;

  readonly newsKeywords: Locator;
  readonly youtubeList: Locator;
  readonly refreshButton: Locator;
  readonly lastUpdated: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newsKeywords = page.locator('[data-testid="news-keywords"]');
    this.youtubeList = page.locator('[data-testid="youtube-trending"]');
    this.refreshButton = page.getByRole('button', { name: /새로고침|갱신/ });
    this.lastUpdated = page.locator('[data-testid="last-updated"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/trends');
    await this.page.waitForLoadState('networkidle');
  }

  async refresh(): Promise<void> {
    await this.refreshButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
