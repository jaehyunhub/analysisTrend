import { Page, Locator } from '@playwright/test';

/**
 * 로그인 모달 Page Object
 * Header의 "로그인" 버튼 클릭 → 모달 → 이메일/비밀번호 입력 → 제출
 */
export class LoginModal {
  readonly page: Page;

  // 셀렉터
  readonly loginButton: Locator;
  readonly modal: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.getByRole('button', { name: '로그인' });
    this.modal = page.getByRole('dialog', { name: /로그인/ });
    this.emailInput = page.getByLabel('이메일').or(page.getByPlaceholder('이메일'));
    this.passwordInput = page.getByLabel('비밀번호').or(page.getByPlaceholder('비밀번호'));
    this.submitButton = this.modal.getByRole('button', { name: /로그인|확인/ });
    this.errorMessage = page.getByRole('alert');
    this.closeButton = this.modal.getByRole('button', { name: /닫기|close/i });
  }

  async open(): Promise<void> {
    await this.loginButton.click();
    await this.modal.waitFor({ state: 'visible' });
  }

  async login(email: string, password: string): Promise<void> {
    await this.open();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.modal.waitFor({ state: 'hidden' });
  }

  async closeWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.modal.waitFor({ state: 'hidden' });
  }
}
