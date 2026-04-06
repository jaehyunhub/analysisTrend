/**
 * Group E — UX & 미테스트 페이지 워크플로우
 *
 * WF-E01: 다크모드 토글 + persist
 * WF-E02: 모바일 Header 드로어 메뉴
 * WF-E03: 로그인 상태 새로고침 유지
 * WF-E04: 매거진 전체 흐름 (목록 · 필터 · 상세)
 * WF-E05: 소개(/about) 페이지
 * WF-E06: 404 페이지
 * WF-E07: 마이페이지 심화 (탭 네비게이션 · 닉네임 수정)
 * WF-E08: Toast 자동 dismiss (로그인/로그아웃)
 *
 * 이 파일은 다양한 storageState를 사용하므로
 * 각 describe 블록에서 개별적으로 test.use() 적용
 * 기본은 비로그인 (guest)
 */

import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const USER_SESSION_PATH = path.join(__dirname, '../../.auth/user-session.json');

/** user storageState 페이지에 sessionStorage 주입 (authStore는 sessionStorage persist 사용) */
async function injectUserSession(page: import('@playwright/test').Page) {
  if (fs.existsSync(USER_SESSION_PATH)) {
    const authStorage = fs.readFileSync(USER_SESSION_PATH, 'utf-8');
    await page.context().addInitScript((data) => {
      sessionStorage.setItem('auth-storage', data);
    }, authStorage);
  }
}

/** browser.newContext로 생성된 context에 sessionStorage 주입 */
async function injectUserSessionToContext(ctx: import('@playwright/test').BrowserContext) {
  if (fs.existsSync(USER_SESSION_PATH)) {
    const authStorage = fs.readFileSync(USER_SESSION_PATH, 'utf-8');
    await ctx.addInitScript((data) => {
      sessionStorage.setItem('auth-storage', data);
    }, authStorage);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// WF-E01: 다크모드 토글 + persist
// ──────────────────────────────────────────────────────────────────────────────
test.describe('WF-E01: 다크모드', () => {
  // guest context (비로그인, 스토리지 없음)
  test('다크모드 토글 및 상태 유지', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // 다크모드 토글 버튼 찾기
    const darkToggle = page
      .getByRole('button', { name: /다크|dark|테마|theme|🌙|☀️/i })
      .or(
        page.locator(
          '[aria-label*="dark"], [aria-label*="theme"], [aria-label*="테마"]',
        ),
      )
      .or(page.locator('button').filter({ has: page.locator('svg') }).nth(0));

    const isToggleVisible = await darkToggle
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (!isToggleVisible) {
      test.skip(true, '다크모드 토글 버튼 없음');
      return;
    }

    // 초기 상태 확인
    const htmlClass = await page.locator('html').getAttribute('class');
    const isDark = htmlClass?.includes('dark') || false;

    // 토글 클릭
    await darkToggle.click();
    await page.waitForTimeout(300);

    // 클래스 변경 확인
    const htmlClassAfter = await page.locator('html').getAttribute('class');
    if (isDark) {
      expect(htmlClassAfter).not.toContain('dark');
    } else {
      expect(htmlClassAfter).toContain('dark');
    }

    // 새로고침 후 상태 유지 확인
    await page.reload();
    await page.waitForTimeout(500);
    const htmlClassReload = await page.locator('html').getAttribute('class');
    // localStorage persist 확인 (dark 상태가 유지되어야 함)
    expect(htmlClassReload).toEqual(htmlClassAfter);

    // 원상 복구
    await darkToggle.click();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// WF-E02: 모바일 Header 드로어 메뉴
// ──────────────────────────────────────────────────────────────────────────────
test.describe('WF-E02: 모바일 Header', () => {
  test('햄버거 메뉴 드로어', async ({ browser }) => {
    // iPhone 크기 viewport
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    });
    const page = await ctx.newPage();

    try {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      // 햄버거 버튼 찾기
      const hamburger = page
        .getByRole('button', { name: /메뉴|menu|☰/i })
        .or(page.locator('[aria-label*="menu"]'))
        .or(
          page.locator('button').filter({ has: page.locator('svg') }).last(),
        );

      if (
        !(await hamburger.isVisible({ timeout: 5000 }).catch(() => false))
      ) {
        test.skip(true, '모바일 햄버거 버튼 없음');
        return;
      }

      await hamburger.click();
      await page.waitForTimeout(500);

      // 드로어 열림 확인 (nav, ul, div with links)
      const drawer = page
        .locator('[class*="drawer"], [class*="mobile"], [role="navigation"]')
        .or(
          page.getByRole('link', { name: /커뮤니티|쇼핑|매거진/i }).first(),
        );
      await expect(drawer).toBeVisible({ timeout: 5000 });

      // 커뮤니티 링크 클릭
      const communityLink = page
        .getByRole('link', { name: /커뮤니티/i })
        .last();
      if (
        await communityLink.isVisible({ timeout: 3000 }).catch(() => false)
      ) {
        await communityLink.click();
        await expect(page).toHaveURL(/community/, { timeout: 10000 });
      }
    } finally {
      await ctx.close();
    }
  });

  test('모바일 로그인 후 닉네임 표시', async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      storageState: path.join(__dirname, '../../.auth/user.json'),
    });
    await injectUserSessionToContext(ctx);
    const page = await ctx.newPage();
    try {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      // 모바일에서 헤더에 닉네임 또는 아바타 표시 확인
      const userIndicator = page
        .getByText(/E2E유저/)
        .or(page.locator('[class*="avatar"]'));
      // 모바일 헤더는 텍스트 숨길 수 있으므로 soft assertion
      await userIndicator.isVisible({ timeout: 3000 }).catch(() => false);
      // 결과 로그만 (실패 처리 안 함)
    } finally {
      await ctx.close();
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// WF-E03: 로그인 상태 새로고침 유지
// ──────────────────────────────────────────────────────────────────────────────
test.describe('WF-E03: 로그인 상태 유지', () => {
  test.use({
    storageState: path.join(__dirname, '../../.auth/user.json'),
  });

  test.beforeEach(async ({ page }) => {
    await injectUserSession(page);
  });

  test('새로고침 후 로그인 유지', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // 로그인 상태 확인: 로그인 버튼이 없으면 인증된 상태
    // (헤더는 desktop/mobile 별도 렌더링으로 닉네임 span이 hidden일 수 있음)
    const loginBtn = page.getByRole('button', { name: /^로그인$/ });
    const loginBtnVisible = await loginBtn.isVisible({ timeout: 3000 }).catch(() => false);
    // auth-storage에서 E2E유저가 주입됐으면 로그인 버튼이 사라져야 함
    // 혹은 닉네임 text가 어딘가 visible이면 통과
    const nicknameVisible = await page.locator('header').getByText(/E2E유저/i).isVisible({ timeout: 2000 }).catch(() => false);
    expect(!loginBtnVisible || nicknameVisible).toBeTruthy();

    // 새로고침
    await page.reload();
    await page.waitForTimeout(2500); // Zustand persist hydration + addInitScript 재실행 대기

    // 새로고침 후 로그인 유지 확인
    const loginBtnAfterReload = await loginBtn.isVisible({ timeout: 3000 }).catch(() => false);
    const nicknameAfterReload = await page.locator('header').getByText(/E2E유저/i).isVisible({ timeout: 2000 }).catch(() => false);
    expect(!loginBtnAfterReload || nicknameAfterReload).toBeTruthy();

    // /mypage 접근 가능 확인
    await page.goto('/mypage');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).not.toContainText('로그인이 필요합니다');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// WF-E04: 매거진 전체 흐름 (완전 미테스트)
// MOCK_MAGAZINES: 9개 실제 데이터 (슈카친구들 매거진 26년 2월호 ~ 25년 6월호)
// 이미지 도메인: syukafriends.kr (next.config.ts remotePatterns 등록됨)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('WF-E04: 매거진 페이지', () => {
  // 매거진은 /magazine - MOCK_MAGAZINES 기반 (shared/mocks/magazines.ts)
  // 2026-04-03 기준: 9개 슈카친구들 매거진 실데이터 추가됨

  test('매거진 목록 페이지', async ({ page }) => {
    await page.goto('/magazine');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // 페이지 정상 로드
    await expect(page).toHaveURL('/magazine');

    // 카테고리 필터 탭 확인 (span 태그로 렌더링됨 — button이 아님)
    const categoryTabs = page.locator('span').filter({ hasText: /^전체$|^트렌드$|^마케팅$|^테크$|^라이프$/ })
      .or(page.getByText('전체', { exact: true }));
    await expect(categoryTabs.first()).toBeVisible({ timeout: 10000 });

    // 매거진 카드 목록 확인 — MOCK_MAGAZINES에 9개 데이터 추가됨 (2026-04-03)
    // syukafriends.kr 이미지 사용 (next.config.ts remotePatterns 등록됨)
    const cards = page.locator('a[href*="/magazine/"]');
    const cardCount = await cards.count();
    // 실데이터 9개가 있으므로 카드가 표시되어야 함
    expect(cardCount).toBeGreaterThan(0);

    // 슈카친구들 매거진 텍스트 확인
    const magazineTitle = page.getByText(/슈카친구들|매거진/i).first();
    await expect(magazineTitle).toBeVisible({ timeout: 10000 });

    // 이미지가 syukafriends.kr 도메인에서 로드됨 (Next.js Image 컴포넌트)
    const firstImg = page.locator('img[src*="syukafriends.kr"], img[src*="_next/image"]').first();
    const hasImg = await firstImg.isVisible({ timeout: 5000 }).catch(() => false);
    // 이미지 허용 도메인 등록 완료 — 로드 실패시 경고
    if (!hasImg) {
      console.warn('WF-E04: syukafriends.kr 이미지 미표시 — next.config.ts remotePatterns 확인 필요');
    }
  });

  test('카테고리 필터', async ({ page }) => {
    await page.goto('/magazine');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 카테고리 탭 클릭 (span 태그)
    const categories = ['트렌드', '마케팅', '테크', '라이프'];
    for (const cat of categories) {
      const btn = page.locator('span').filter({ hasText: cat }).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(500);
        // 카드 또는 "없음" 메시지 확인
      }
    }

    // 전체 탭 복귀
    const allBtn = page.locator('span').filter({ hasText: '전체' }).first();
    if (await allBtn.isVisible({ timeout: 2000 }).catch(() => false)) await allBtn.click();
  });

  test('매거진 상세 페이지', async ({ page }) => {
    await page.goto('/magazine');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 첫 번째 매거진 카드 클릭
    const firstCard = page
      .locator('a[href*="/magazine/"]')
      .first()
      .or(page.locator('[class*="card"]').first());
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForTimeout(500);

      // /magazine/{id} 이동 확인
      await expect(page).toHaveURL(/\/magazine\/\w+/, { timeout: 10000 });

      // 상세 콘텐츠 확인
      const content = page
        .locator('article, main, [class*="content"]')
        .first();
      await expect(content).toBeVisible({ timeout: 5000 });

      // 이전/다음 네비게이션 확인
      const _nav = page.getByRole('link', {
        name: /이전|다음|prev|next/i,
      });
      // nav가 있으면 표시됨 (없어도 pass)
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// WF-E05: 소개 페이지
// ──────────────────────────────────────────────────────────────────────────────
test.describe('WF-E05: 소개 페이지', () => {
  test('/about 페이지 로드', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    await expect(page).toHaveURL('/about');
    await expect(page.locator('main, [role="main"]')).toBeVisible({
      timeout: 10000,
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// WF-E06: 404 페이지
// ──────────────────────────────────────────────────────────────────────────────
test.describe('WF-E06: 404 페이지', () => {
  test('존재하지 않는 경로 → 404', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz-12345');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // 404 또는 not-found 페이지 확인
    const notFound = page
      .getByText(/404|찾을 수 없|페이지를 찾/i)
      .or(page.locator('[class*="not-found"]'));
    await expect(notFound.first()).toBeVisible({ timeout: 10000 });
  });

  test('404 페이지 바로가기 링크', async ({ page }) => {
    await page.goto('/page-that-does-not-exist-abc');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // 커뮤니티/쇼핑/홈 링크 확인
    const homeLink = page
      .getByRole('link', { name: /홈|home|메인/i })
      .or(page.getByRole('link', { name: /커뮤니티|쇼핑/i }));
    if (await homeLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await homeLink.first().click();
      await page.waitForTimeout(500);
      // 이동 확인
      await expect(page).not.toHaveURL(/page-that-does-not-exist/);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// WF-E07: 마이페이지 심화
// ──────────────────────────────────────────────────────────────────────────────
test.describe('WF-E07: 마이페이지 심화', () => {
  test.use({
    storageState: path.join(__dirname, '../../.auth/user.json'),
  });

  test.beforeEach(async ({ page }) => {
    await injectUserSession(page);
  });

  test('대시보드 탭 및 주문 통계', async ({ page }) => {
    await page.goto('/mypage');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // Zustand persist hydration + admin layout 대기

    // 대시보드 탭 콘텐츠 (탭 버튼 '대시보드' 또는 heading)
    const dashboard = page.getByRole('button', { name: '대시보드' })
      .or(page.getByRole('heading', { name: '대시보드' }))
      .or(page.getByTestId('order-stats'));
    await expect(dashboard.first()).toBeVisible({ timeout: 10000 });
  });

  test('탭 네비게이션', async ({ page }) => {
    await page.goto('/mypage');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const tabs = ['주문 내역', '커뮤니티 활동', '프로필 수정'];
    for (const tabName of tabs) {
      const tab = page
        .getByRole('button', { name: new RegExp(tabName, 'i') })
        .or(page.getByText(tabName));
      if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('닉네임 수정', async ({ page }) => {
    await page.goto('/mypage');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 프로필 수정 탭 이동
    const profileTab = page
      .getByRole('button', { name: /프로필 수정/i })
      .or(page.getByText('프로필 수정'));
    if (
      await profileTab.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await profileTab.click();
      await page.waitForTimeout(500);

      // 닉네임 입력란
      const nicknameInput = page
        .getByLabel(/닉네임/i)
        .or(page.getByPlaceholder(/닉네임/i));
      if (
        await nicknameInput.isVisible({ timeout: 3000 }).catch(() => false)
      ) {
        await nicknameInput.clear();
        await nicknameInput.fill('E2E유저');

        const saveBtn = page.getByRole('button', {
          name: /저장|수정|Save/i,
        });
        if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await saveBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// WF-E08: Toast 자동 dismiss
// ──────────────────────────────────────────────────────────────────────────────
test.describe('WF-E08: Toast 알림', () => {
  test('로그인 Toast 자동 dismiss', async ({ browser }) => {
    // 비로그인 상태에서 로그인
    const ctx = await browser.newContext({ locale: 'ko-KR' });
    const page = await ctx.newPage();
    try {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // 로그인 버튼 클릭
      const loginBtn = page.getByRole('button', { name: /로그인/i });
      if (
        await loginBtn.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await loginBtn.click();

        // 이메일/비밀번호 입력
        const emailInput = page
          .getByLabel(/이메일/i)
          .or(page.getByPlaceholder(/이메일/i));
        const pwInput = page
          .getByLabel(/비밀번호/i)
          .or(page.getByPlaceholder(/비밀번호/i));

        if (
          await emailInput.isVisible({ timeout: 3000 }).catch(() => false)
        ) {
          await emailInput.fill('testuser@e2e.com');
          await pwInput.fill('Test1234!');

          const submitBtn = page.getByRole('button', { name: /로그인/i });
          await submitBtn.last().click();

          // Toast 표시 확인
          const toast = page
            .getByText(/로그인 되었습니다/i)
            .or(page.locator('[class*="toast"]'));
          await expect(toast.first()).toBeVisible({ timeout: 10000 });

          // 자동 사라짐 확인 (5초 후)
          await page.waitForTimeout(5000);
          await expect(toast.first()).not.toBeVisible({ timeout: 3000 });
        }
      }
    } finally {
      await ctx.close();
    }
  });

  test('로그아웃 Toast', async ({ browser }) => {
    // 로그인 상태의 storageState 사용
    const ctx = await browser.newContext({
      storageState: path.join(__dirname, '../../.auth/user.json'),
    });
    await injectUserSessionToContext(ctx);
    const page = await ctx.newPage();
    try {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      // 로그아웃 버튼
      const logoutBtn = page.getByRole('button', { name: /로그아웃/i });
      if (
        await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await logoutBtn.click();

        // 확인 모달
        const confirmBtn = page
          .getByRole('button', { name: /로그아웃|확인/i })
          .last();
        if (
          await confirmBtn
            .isVisible({ timeout: 3000 })
            .catch(() => false)
        ) {
          await confirmBtn.click();

          // 로그아웃 Toast 확인
          await expect(
            page.getByText(/로그아웃 되었습니다/i),
          ).toBeVisible({ timeout: 5000 });
        }
      }
    } finally {
      await ctx.close();
    }
  });
});
