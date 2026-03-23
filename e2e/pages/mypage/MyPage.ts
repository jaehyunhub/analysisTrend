import { Page, Locator } from '@playwright/test';

/**
 * 마이페이지 Page Object
 * MY-01: 주문 현황 대시보드
 * MY-02: 프로필 수정
 */
export class MyPage {
  readonly page: Page;

  /** 주문 현황 통계 영역 */
  readonly orderStats: Locator;
  readonly profileEditButton: Locator;
  readonly nicknameInput: Locator;
  readonly bioInput: Locator;
  readonly saveButton: Locator;
  readonly orderFilterAll: Locator;
  readonly orderFilterPending: Locator;

  constructor(page: Page) {
    this.page = page;
    // 구버전: data-testid 없음 — "Dashboard Overview" 헤딩 아래 카드 영역
    this.orderStats = page.locator('[data-testid="order-stats"]').or(
      page.getByRole('heading', { name: /Dashboard Overview|주문 현황|마이페이지/i }).locator('..')
    );
    this.profileEditButton = page.getByRole('button', { name: /프로필 수정|편집|Account Settings|Edit Profile/i });
    this.nicknameInput = page.getByLabel(/닉네임|Nickname/i).or(page.getByPlaceholder(/닉네임|Nickname/i));
    this.bioInput = page.getByLabel(/자기소개|Bio/i).or(page.getByPlaceholder(/자기소개|Bio/i));
    this.saveButton = page.getByRole('button', { name: /저장|확인|Save/i });
    this.orderFilterAll = page.getByRole('button', { name: /전체|All/i });
    this.orderFilterPending = page.getByRole('button', { name: /준비중|결제완료|Pending/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/mypage');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(300);
  }
}
