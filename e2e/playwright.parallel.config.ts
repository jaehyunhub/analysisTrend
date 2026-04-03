/**
 * 병렬 테스트용 Playwright 설정
 * - globalSetup 없음 (global-setup.ts는 사전에 1회 실행 필요)
 * - fullyParallel: true, workers: 4
 * - 각 에이전트가 --project 플래그로 특정 프로젝트만 실행
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // globalSetup 제거 — 사전에 수동으로 1회 실행됨
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 4,
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
    {
      name: 'chromium:guest',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/(home|auth)\/.+\.spec\.ts/,
    },
    {
      name: 'chromium:user',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      testMatch: /tests\/(community|shop|mypage)\/.+\.spec\.ts/,
    },
    {
      name: 'chromium:admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/admin.json',
      },
      testMatch: /tests\/admin\/.+\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'echo "서비스가 이미 실행 중이어야 합니다. docker-compose up -d 를 먼저 실행하세요."',
    url: 'http://localhost',
    reuseExistingServer: true,
    timeout: 10_000,
  },
});
