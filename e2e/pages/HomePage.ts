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
    // Hero 배너: main 내 첫 번째 h1 (한/영 모두 대응)
    this.banner = page.locator('main h1').first().or(
      page.locator('[data-testid="hero-banner"]')
    );
    // YouTube 그리드: "YouTube" 텍스트가 있는 h2 근처 그리드 (한/영 공통)
    this.videoGrid = page.getByRole('heading', { name: /youtube/i }).locator('../..').or(
      page.locator('[data-testid="video-grid"]')
    );
    // 방송 일정 위젯: "Schedule" 또는 "방송 일정" h2를 포함하는 컨테이너
    this.scheduleWidget = page.getByRole('heading', { name: /schedule|방송 일정/i }).locator('../..').or(
      page.locator('[data-testid="schedule-widget"]')
    );
    this.communityWidget = page.getByRole('heading', { name: /community|커뮤니티/i }).first().locator('../..').or(
      page.locator('[data-testid="community-widget"]')
    );
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }
}
