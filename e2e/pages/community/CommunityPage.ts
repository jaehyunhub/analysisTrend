import { Page, Locator } from '@playwright/test';

/**
 * 커뮤니티 페이지 Page Object
 * COMM-01~05: 글 CRUD, 투표, 정렬, 검색
 */
export class CommunityPage {
  readonly page: Page;

  readonly writeButton: Locator;
  readonly postList: Locator;
  readonly searchInput: Locator;
  readonly filterBest: Locator;
  readonly filterHot: Locator;
  readonly filterNew: Locator;
  readonly filterTop: Locator;

  constructor(page: Page) {
    this.page = page;
    this.writeButton = page.getByRole('button', { name: /글 작성|새 글/ });
    this.postList = page.locator('[data-testid="post-list"]');
    this.searchInput = page.getByPlaceholder(/검색/);
    this.filterBest = page.getByRole('button', { name: 'Best' });
    this.filterHot = page.getByRole('button', { name: 'Hot' });
    this.filterNew = page.getByRole('button', { name: 'New' });
    this.filterTop = page.getByRole('button', { name: 'Top' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/community');
    await this.page.waitForLoadState('networkidle');
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    // 디바운스 300ms 대기
    await this.page.waitForTimeout(400);
  }

  async openWriteModal(): Promise<void> {
    await this.writeButton.click();
    await this.page.getByRole('dialog').waitFor({ state: 'visible' });
  }

  getPostByTitle(title: string): Locator {
    return this.postList.getByText(title);
  }
}
