import { Page, Locator } from '@playwright/test';
import * as path from 'path';

/**
 * 채팅 분석 Page Object
 * CHAT-01~05: 파일 업로드 → 히트맵 → 피크 → 키워드 → CSV 다운로드
 */
export class ChatAnalysisPage {
  readonly page: Page;

  readonly fileInput: Locator;
  readonly uploadButton: Locator;
  readonly progressBar: Locator;
  readonly heatmap: Locator;
  readonly peakList: Locator;
  readonly keywordList: Locator;
  readonly downloadButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fileInput = page.locator('input[type="file"]');
    this.uploadButton = page.getByRole('button', { name: /업로드|분석/ });
    this.progressBar = page.getByRole('progressbar');
    this.heatmap = page.locator('[data-testid="heatmap"]');
    this.peakList = page.locator('[data-testid="peak-list"]');
    this.keywordList = page.locator('[data-testid="keyword-list"]');
    this.downloadButton = page.getByRole('button', { name: /CSV 다운로드|다운로드/ });
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/chat');
    await this.page.waitForLoadState('networkidle');
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
    await this.uploadButton.click();
  }

  /** 테스트용 샘플 CSV 경로 */
  static get sampleCSVPath(): string {
    return path.join(__dirname, '../../fixtures/sample-chat.csv');
  }
}
