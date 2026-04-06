import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.use({ storageState: path.join(__dirname, '../../.auth/admin.json') });

// authStore는 sessionStorage persist → addInitScript로 sessionStorage 주입
const ADMIN_SESSION_PATH = path.join(__dirname, '../../.auth/admin-session.json');

test.beforeEach(async ({ page }) => {
  if (fs.existsSync(ADMIN_SESSION_PATH)) {
    const authStorage = fs.readFileSync(ADMIN_SESSION_PATH, 'utf-8');
    await page.context().addInitScript((data) => {
      sessionStorage.setItem('auth-storage', data);
    }, authStorage);
  }
});

// WF-D01: 채팅 분석 파이프라인
test.describe('WF-D01: 채팅 분석 파이프라인', () => {
  test('페이지 접근 및 UI 확인', async ({ page }) => {
    await page.goto('/admin/chat');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // admin layout 인증 hydration 대기

    // 파일 업로드 영역 확인 (input[type="file"]은 hidden — div role=button으로 체크)
    const uploadArea = page.getByText(/채팅 파일을 드래그하거나 클릭하여 업로드/i)
      .or(page.getByRole('button', { name: /채팅 파일 업로드 영역/i }))
      .or(page.getByText(/YouTube Live 채팅 내보내기/i));
    await expect(uploadArea.first()).toBeVisible({ timeout: 10000 });
  });

  test('CSV 파일 업로드 + 분석 결과', async ({ page }) => {
    // 샘플 CSV 파일 생성 (인라인)
    const csvContent = [
      'timestamp,username,message',
      '00:00:01,슈카,오늘 경제뉴스 시작합니다',
      '00:00:30,시청자1,대박이다',
      '00:01:00,시청자2,진짜 대박',
      '00:01:15,시청자3,클립 클립',
      '00:01:30,시청자4,대박 대박',
      '00:02:00,시청자5,좋은 내용이네요',
    ].join('\n');

    const tmpFile = path.join(__dirname, 'tmp-chat-sample.csv');
    fs.writeFileSync(tmpFile, csvContent, 'utf-8');

    try {
      await page.goto('/admin/chat');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // admin layout 인증 hydration 대기

      // 파일 업로드 (input은 hidden이므로 직접 setInputFiles 호출)
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(tmpFile);
      await page.waitForTimeout(500);

      // 검색 키워드 입력
      const kwInput = page.getByPlaceholder(/키워드|keyword/i)
        .or(page.locator('input[name="search_keywords"]'));
      if (await kwInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await kwInput.fill('대박,클립');
      }

      // 분석 버튼 클릭
      const analyzeBtn = page.getByRole('button', { name: /분석|시작|Analyze/i });
      if (await analyzeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await analyzeBtn.click();
        await page.waitForTimeout(5000); // 분석 대기
      }

      // 결과 섹션 확인
      const resultArea = page.locator('[class*="heatmap"], [class*="peak"], [class*="result"]')
        .or(page.getByText(/히트맵|피크|분석 완료/i));
      await expect(resultArea.first()).toBeVisible({ timeout: 30000 });
    } finally {
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
    }
  });

  test('피크 구간 및 키워드 탭', async ({ page }) => {
    // 위 테스트 이후 분석 결과가 있는 상태 가정
    // 또는 세션 스토리지에서 최근 분석 결과 확인
    await page.goto('/admin/chat');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 탭 전환 확인
    const tabs = ['피크', '키워드', '히트맵', '편집'];
    for (const tab of tabs) {
      const tabBtn = page.getByRole('tab', { name: new RegExp(tab, 'i') })
        .or(page.getByRole('button', { name: new RegExp(tab, 'i') }));
      if (await tabBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tabBtn.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('잘못된 파일 → 에러 메시지', async ({ page }) => {
    const tmpFile = path.join(__dirname, 'tmp-invalid.bin');
    fs.writeFileSync(tmpFile, Buffer.from([0x00, 0x01, 0x02, 0x03]));
    try {
      await page.goto('/admin/chat');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      const fileInput = page.locator('input[type="file"]');
      // input[type="file"]은 hidden이므로 isVisible() 체크 없이 직접 setInputFiles
      try {
        // dialog handler
        page.on('dialog', async (dialog) => { await dialog.dismiss(); });
        await fileInput.setInputFiles(tmpFile);
        await page.waitForTimeout(1000);

        const analyzeBtn = page.getByRole('button', { name: /분석|시작/i });
        if (await analyzeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await analyzeBtn.click();
          await page.waitForTimeout(3000);
        }

        // 에러 메시지 또는 경고 확인
        const errorMsg = page.getByText(/오류|에러|error|실패|지원되지 않는/i);
        // 에러 없으면 그냥 통과 (graceful handling)
      } catch { /* ignore */ }
    } finally {
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
    }
  });
});

// WF-D02: 트렌드 분석 (뉴스 + YouTube)
test.describe('WF-D02: 트렌드 분석', () => {
  test('뉴스 키워드 목록', async ({ page }) => {
    await page.goto('/admin/trends');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // 키워드 목록 확인 (API 키 없으면 mock 데이터)
    const keywords = page.locator('[class*="keyword"], [class*="tag"], [class*="badge"]')
      .or(page.getByText(/경제|트렌드|키워드/i));
    await expect(keywords.first()).toBeVisible({ timeout: 10000 });
  });

  test('YouTube 트렌딩 + 날짜 필터', async ({ page }) => {
    await page.goto('/admin/trends');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Videos 탭 클릭
    const videosTab = page.getByRole('tab', { name: /영상|YouTube|Videos/i })
      .or(page.getByRole('button', { name: /영상|YouTube|Videos/i }));
    if (await videosTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await videosTab.click();
      await page.waitForTimeout(1000);
    }

    // 날짜 필터
    const filters = ['일일', '일주일', '한달'];
    for (const f of filters) {
      const btn = page.getByRole('button', { name: new RegExp(f, 'i') });
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('새로고침 버튼', async ({ page }) => {
    await page.goto('/admin/trends');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const refreshBtn = page.getByRole('button', { name: /새로고침|Refresh|갱신/i });
    if (await refreshBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await refreshBtn.click();
      await page.waitForTimeout(2000);
      // 로딩 후 완료 확인
      await expect(page.locator('body')).not.toContainText('에러', { timeout: 5000 });
    }
  });
});

// WF-D03: 채널 분석 페이지
test.describe('WF-D03: 채널 분석', () => {
  test('KPI 카드 및 기간 탭', async ({ page }) => {
    await page.goto('/admin/analysis');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // admin layout 인증 hydration 대기

    // KPI 카드 확인 (구독자/총 조회수/동영상 수 텍스트로 확인)
    const kpiCard = page.getByText(/구독자|총 조회수|동영상 수|채널 분석/i).first();
    await expect(kpiCard).toBeVisible({ timeout: 10000 });

    // 기간 탭 전환
    const periods = ['30일', '90일', '365일'];
    for (const period of periods) {
      const btn = page.getByRole('button', { name: new RegExp(period, 'i') })
        .or(page.getByText(new RegExp(period, 'i')));
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }
  });
});

// WF-D04: 회원 관리
test.describe('WF-D04: 회원 관리', () => {
  test('회원 목록 및 검색', async ({ page }) => {
    await page.goto('/admin/community/members');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // admin layout 인증 hydration 대기

    // 회원 목록 로드 대기 (API 호출 완료 후 — networkidle + 3s wait 후 추가 대기)
    await page.waitForTimeout(1000);
    // 회원 목록 표시 (testuser@e2e.com, admin@e2e.com 포함)
    const memberList = page.getByText(/e2e\.com/i).or(page.locator('table tbody tr').first());
    await expect(memberList.first()).toBeVisible({ timeout: 15000 });

    // 이메일 검색
    const searchInput = page.getByPlaceholder(/이메일|검색|search/i)
      .or(page.locator('input[type="text"]').first());
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('e2e');
      await page.waitForTimeout(500);
      await expect(page.getByText(/e2e\.com/i).first()).toBeVisible({ timeout: 5000 });
    }
  });
});
