import { defineConfig, devices } from '@playwright/test';

/**
 * analysisTrend E2E 테스트 설정
 *
 * 실행 전제: docker-compose up -d 로 전체 서비스 기동 (Nginx :80)
 * baseURL: http://localhost (Nginx 리버스 프록시)
 */
export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup',  // storageState 생성 (user.json, admin.json)
  fullyParallel: false,       // docker-compose 환경에서 DB 충돌 방지
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },

  projects: [
    // --- 비로그인 테스트 ---
    {
      name: 'chromium:guest',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/(home|auth)\/.+\.spec\.ts/,
    },

    // --- 일반 사용자 테스트 ---
    {
      name: 'chromium:user',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',   // globalSetup에서 저장
      },
      testMatch: /tests\/(community|shop|mypage)\/.+\.spec\.ts/,
    },

    // --- 관리자 테스트 ---
    {
      name: 'chromium:admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/admin.json',  // globalSetup에서 저장
      },
      testMatch: /tests\/admin\/.+\.spec\.ts/,
    },
  ],

  // docker-compose 기동 여부만 확인 (실제 시작은 global-setup에서)
  webServer: {
    command: 'echo "서비스가 이미 실행 중이어야 합니다. docker-compose up -d 를 먼저 실행하세요."',
    url: 'http://localhost',
    reuseExistingServer: true,
    timeout: 10_000,
  },
});
