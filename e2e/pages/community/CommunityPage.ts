import { Page, Locator } from '@playwright/test';

/**
 * 커뮤니티 페이지 Page Object
 * COMM-01~05: 글 CRUD, 투표, 정렬, 검색
 */
export class CommunityPage {
  readonly page: Page;

  readonly writeButton: Locator;
  /** posts feed area (구버전: 3개 generic post card 포함 컨테이너) */
  readonly postFeed: Locator;
  readonly searchInput: Locator;
  readonly filterBest: Locator;
  readonly filterHot: Locator;
  readonly filterNew: Locator;
  readonly filterTop: Locator;

  constructor(page: Page) {
    this.page = page;
    // 한/영 대응
    this.writeButton = page.getByRole('button', { name: /Create Post|글 작성|새 글/i });
    // 피드 내 post card heading (구버전: h3)
    this.postFeed = page.getByRole('heading', { level: 3 }).first().or(
      page.locator('[data-testid="post-list"]').first()
    );
    this.searchInput = page.getByPlaceholder(/Search for posts|검색/i);
    this.filterBest = page.getByRole('button', { name: /베스트|Best/i });
    this.filterHot = page.getByRole('button', { name: /인기|Hot/i });
    this.filterNew = page.getByRole('button', { name: /최신|New/i });
    this.filterTop = page.getByRole('button', { name: /상위|Top/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/community');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(500);
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    // 디바운스 300ms 대기
    await this.page.waitForTimeout(400);
  }

  /**
   * "Create Post" 클릭 → dialog 또는 login modal 대기
   * 구버전: dialog 없을 수 있음 (skip 처리는 테스트에서 담당)
   */
  async openWriteModal(): Promise<boolean> {
    await this.writeButton.click();
    const dialog = this.page.getByRole('dialog');
    const appeared = await dialog.waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    return appeared;
  }

  /** 제목으로 게시글 찾기 (피드 내 heading or page text) */
  getPostByTitle(title: string): Locator {
    return this.page.getByRole('heading', { name: title }).or(
      this.page.getByText(title, { exact: false })
    );
  }
}
