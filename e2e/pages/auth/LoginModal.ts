import { Page, Locator } from '@playwright/test';

/**
 * 로그인 모달 Page Object
 * Header의 "로그인 / Log In" 버튼 클릭 → 모달 → 이메일/비밀번호 입력 → 제출
 *
 * NOTE: 실제 LoginModal은 role="dialog"가 아닌 generic div로 렌더링됨.
 *       heading "Log in / 로그인"을 모달 존재 여부 기준으로 사용.
 */
export class LoginModal {
  readonly page: Page;

  // 셀렉터
  readonly loginButton: Locator;
  readonly modalHeading: Locator;
  readonly modal: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // 헤더의 로그인 버튼 (처음 매칭되는 것, 모달 내 제출 버튼과 구분)
    this.loginButton = page.getByRole('button', { name: /^(로그인|Log In)$/i }).first();
    // 모달 heading (한/영 대응)
    this.modalHeading = page.getByRole('heading', { name: /^(로그인|Log in)$/i });
    // 모달 wrapper (heading 기준)
    this.modal = this.modalHeading.locator('../..');
    this.emailInput = page.getByRole('textbox', { name: /email|이메일/i });
    this.passwordInput = page.getByRole('textbox', { name: /password|비밀번호/i });
    // 모달 내 제출 버튼 (헤더 버튼과 달리 모달이 열린 상태에서만 접근)
    this.submitButton = this.modal.getByRole('button', { name: /로그인|Log In|확인|Submit/i });
    this.errorMessage = page.getByRole('alert');
    // 모달 내 닫기 버튼: X 아이콘 또는 이미지를 포함한 버튼 (모달 컨테이너 내부만 탐색)
    this.closeButton = this.modal.getByRole('button').filter({ has: page.locator('img, svg') }).first();
  }

  async open(): Promise<void> {
    await this.loginButton.click();
    await this.modalHeading.waitFor({ state: 'visible', timeout: 8000 });
  }

  async login(email: string, password: string): Promise<void> {
    await this.open();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.modalHeading.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async closeWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.modalHeading.waitFor({ state: 'hidden', timeout: 5000 });
  }
}
