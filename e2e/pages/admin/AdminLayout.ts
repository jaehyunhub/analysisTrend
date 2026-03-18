import { Page, Locator } from '@playwright/test';

/**
 * 관리자 레이아웃 Page Object
 * 사이드바 네비게이션 + 라우트 가드 검증
 */
export class AdminLayout {
  readonly page: Page;

  readonly sidebar: Locator;
  readonly navBanner: Locator;
  readonly navSchedule: Locator;
  readonly navYoutube: Locator;
  readonly navTrends: Locator;
  readonly navChat: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('[data-testid="admin-sidebar"]').or(page.locator('nav'));
    this.navBanner = page.getByRole('link', { name: /배너/ });
    this.navSchedule = page.getByRole('link', { name: /스케줄|일정/ });
    this.navYoutube = page.getByRole('link', { name: /YouTube|유튜브/ });
    this.navTrends = page.getByRole('link', { name: /트렌드/ });
    this.navChat = page.getByRole('link', { name: /채팅 분석/ });
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin');
    await this.page.waitForLoadState('networkidle');
  }
}
