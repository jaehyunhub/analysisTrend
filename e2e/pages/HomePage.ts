import { Page, Locator } from '@playwright/test';

/**
 * 홈 페이지 Page Object
 * HOME-01~03: 배너, YouTube 영상 그리드, 방송 일정
 */
export class HomePage {
  readonly page: Page;

  readonly banner: Locator;
  readonly videoGrid: Locator;
  readonly scheduleWidget: Locator;
  readonly communityWidget: Locator;

  constructor(page: Page) {
    this.page = page;
    this.banner = page.locator('[data-testid="hero-banner"]').or(page.locator('.banner'));
    this.videoGrid = page.locator('[data-testid="video-grid"]');
    this.scheduleWidget = page.locator('[data-testid="schedule-widget"]');
    this.communityWidget = page.locator('[data-testid="community-widget"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }
}
