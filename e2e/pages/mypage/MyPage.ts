import { Page, Locator } from '@playwright/test';

/**
 * 마이페이지 Page Object
 * MY-01: 주문 현황 대시보드
 * MY-02: 프로필 수정
 */
export class MyPage {
  readonly page: Page;

  readonly orderStats: Locator;
  readonly profileEditButton: Locator;
  readonly nicknameInput: Locator;
  readonly bioInput: Locator;
  readonly saveButton: Locator;
  readonly orderFilterAll: Locator;
  readonly orderFilterPending: Locator;

  constructor(page: Page) {
    this.page = page;
    this.orderStats = page.locator('[data-testid="order-stats"]');
    this.profileEditButton = page.getByRole('button', { name: /프로필 수정|편집/ });
    this.nicknameInput = page.getByLabel('닉네임').or(page.getByPlaceholder('닉네임'));
    this.bioInput = page.getByLabel('자기소개').or(page.getByPlaceholder('자기소개'));
    this.saveButton = page.getByRole('button', { name: /저장|확인/ });
    this.orderFilterAll = page.getByRole('button', { name: '전체' });
    this.orderFilterPending = page.getByRole('button', { name: /준비중|결제완료/ });
  }

  async goto(): Promise<void> {
    await this.page.goto('/mypage');
    await this.page.waitForLoadState('networkidle');
  }
}
