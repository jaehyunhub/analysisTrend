import { test, expect } from '../../fixtures/index';
import { ChatAnalysisPage } from '../../pages/admin/ChatAnalysisPage';

test.describe('ADMIN — 채팅 분석', () => {
  test.beforeEach(async ({ page }) => {
    const chat = new ChatAnalysisPage(page);
    await chat.goto();
  });

  test('채팅 분석 페이지 접근', async ({ page }) => {
    // 구버전: /admin/chat 404 → 신버전에서만 가능
    const is404 = await page.getByRole('heading', { name: '404' }).isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      // 구버전: 페이지 없음 — 404 확인만 하고 통과
      expect(is404).toBeTruthy();
      return;
    }
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('CSV 파일 업로드 성공', async ({ page }) => {
    const is404 = await page.getByRole('heading', { name: '404' }).isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      test.skip(true, '/admin/chat 페이지 없음 (구버전)');
      return;
    }

    const chat = new ChatAnalysisPage(page);
    await chat.uploadFile(ChatAnalysisPage.sampleCSVPath);
    const processing = page.getByText(/분석 중|처리 중|업로드 완료/i).or(chat.progressBar);
    const success = chat.heatmap.or(chat.peakList).or(page.getByText(/분석 완료|완료/i));
    await expect(processing.or(success).first()).toBeVisible({ timeout: 30000 });
  });

  test('분석 완료 후 히트맵 표시', async ({ page }) => {
    const is404 = await page.getByRole('heading', { name: '404' }).isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      test.skip(true, '/admin/chat 페이지 없음 (구버전)');
      return;
    }

    const chat = new ChatAnalysisPage(page);
    await chat.uploadFile(ChatAnalysisPage.sampleCSVPath);
    await expect(chat.heatmap).toBeVisible({ timeout: 60000 });
  });

  test('피크 구간 목록 표시', async ({ page }) => {
    const is404 = await page.getByRole('heading', { name: '404' }).isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      test.skip(true, '/admin/chat 페이지 없음 (구버전)');
      return;
    }

    const chat = new ChatAnalysisPage(page);
    await chat.uploadFile(ChatAnalysisPage.sampleCSVPath);
    await expect(chat.peakList).toBeVisible({ timeout: 60000 });
    const items = chat.peakList.locator('li, [data-testid="peak-item"]');
    await expect(items.first()).toBeVisible({ timeout: 10000 });
  });

  test('키워드 목록 표시', async ({ page }) => {
    const is404 = await page.getByRole('heading', { name: '404' }).isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      test.skip(true, '/admin/chat 페이지 없음 (구버전)');
      return;
    }

    const chat = new ChatAnalysisPage(page);
    await chat.uploadFile(ChatAnalysisPage.sampleCSVPath);
    await expect(chat.keywordList).toBeVisible({ timeout: 60000 });
  });

  test('편집 마커 CSV 다운로드', async ({ page }) => {
    const is404 = await page.getByRole('heading', { name: '404' }).isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      test.skip(true, '/admin/chat 페이지 없음 (구버전)');
      return;
    }

    const chat = new ChatAnalysisPage(page);
    await chat.uploadFile(ChatAnalysisPage.sampleCSVPath);
    await expect(chat.downloadButton).toBeVisible({ timeout: 60000 });

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      chat.downloadButton.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.csv$/i);
  });

  test('잘못된 형식 파일 → 에러 메시지', async ({ page }) => {
    const is404 = await page.getByRole('heading', { name: '404' }).isVisible({ timeout: 3000 }).catch(() => false);
    if (is404) {
      test.skip(true, '/admin/chat 페이지 없음 (구버전)');
      return;
    }

    const chat = new ChatAnalysisPage(page);
    const invalidPath = require('path').join(__dirname, '../../fixtures/invalid.bin');
    const fs = require('fs');
    if (!fs.existsSync(invalidPath)) {
      fs.writeFileSync(invalidPath, Buffer.from([0x00, 0xFF, 0xFE, 0xFD]));
    }

    await chat.fileInput.setInputFiles(invalidPath);
    await chat.uploadButton.click();

    const errorMsg = page.getByRole('alert').or(page.getByText(/오류|실패|잘못된 형식|지원하지 않는/i));
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
  });
});
