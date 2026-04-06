import { defineConfig, devices } from '@playwright/test';

/**
 * analysisTrend E2E 테스트 설정
 *
 * 실행 전제: docker-compose up -d 로 전체 서비스 기동 (Nginx :80)
 * baseURL: http://localhost (Nginx 리버스 프록시)
 *
 * 테스트 구조: tests/workflows/ (group-a ~ group-f)
 *   - group-a: 홈화면 + 관리자 콘텐츠 (배너/일정/유튜브/광고/매거진)
 *   - group-b: 커뮤니티 워크플로우
 *   - group-c: 쇼핑몰 워크플로우
 *   - group-d: 분석 도구 (채팅분석/트렌드/채널분석/회원관리)
 *   - group-e: UX & 누락 페이지 (다크모드/모바일/매거진/마이페이지)
 *   - group-f: 커뮤니티 종합 (유저·관리자 관점, wepoll 실데이터 기반)
 */
export default defineConfig({
  testDir: './tests/workflows',
  globalSetup: './global-setup',  // storageState 생성 (user.json, admin.json)
  fullyParallel: false,           // docker-compose 환경에서 DB 충돌 방지
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
    // 워크플로우 테스트 — admin 기본 storageState, 내부에서 user/guest context 전환
    {
      name: 'chromium:workflow',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/admin.json',
      },
    },
  ],

  // docker-compose 기동 여부만 확인
  webServer: {
    command: 'echo "서비스가 이미 실행 중이어야 합니다. docker-compose up -d 를 먼저 실행하세요."',
    url: 'http://localhost',
    reuseExistingServer: true,
    timeout: 10_000,
  },
});
