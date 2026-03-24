import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { ApiHelper } from './helpers/api';
import { setAdminRole } from './helpers/db';

/**
 * 전체 테스트 시작 전 1회 실행
 * 1. .auth/ 디렉토리 생성
 * 2. 테스트용 계정 생성 (없으면 회원가입)
 * 3. API 직접 로그인 → storageState를 localStorage에 직접 주입하여 저장
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || 'http://localhost';

  // .auth 디렉토리 생성
  const authDir = path.join(__dirname, '.auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir);

  const api = new ApiHelper(baseURL);

  // --- 테스트 계정 준비 ---
  await api.ensureUserExists({
    email: process.env.TEST_USER_EMAIL || 'testuser@e2e.com',
    password: process.env.TEST_USER_PASSWORD || 'Test1234!',
    nickname: 'E2E유저',
  });

  await api.ensureAdminExists({
    email: process.env.TEST_ADMIN_EMAIL || 'admin@e2e.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'Admin1234!',
    nickname: 'E2E관리자',
  });

  // signup API는 항상 USER role로 생성하므로 DB에서 직접 ADMIN role로 업데이트
  const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@e2e.com';
  await setAdminRole(adminEmail);

  /**
   * API로 로그인하고 localStorage에 auth 상태를 직접 주입하여 storageState 저장
   * Zustand persist의 user 직렬화 이슈를 우회합니다.
   */
  async function loginViaApiAndSave(email: string, password: string, nickname: string, role: string, filePath: string) {
    // 백엔드 API 직접 호출로 토큰 취득
    const loginRes = await fetch(`${baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed for ${email}: ${loginRes.status}`);
    }

    const loginJson = await loginRes.json() as { data: { accessToken: string; refreshToken: string; nickname: string; role: string; email: string } };
    const data = loginJson.data;

    const accessToken = data.accessToken;
    const refreshToken = data.refreshToken;
    const resolvedRole = data.role || role;
    const resolvedNickname = data.nickname || nickname;

    // Zustand auth-storage에 저장될 user 객체 구성
    const user = {
      id: 0,
      email: data.email || email,
      nickname: resolvedNickname,
      role: resolvedRole,
      provider: 'LOCAL',
      createdAt: new Date().toISOString(),
    };

    // Zustand persist 형식으로 auth-storage 값 구성
    const authStorageValue = JSON.stringify({
      state: {
        user,
        accessToken,
        isAuthenticated: true,
      },
      version: 0,
    });

    // 브라우저 컨텍스트에 localStorage 직접 주입
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(baseURL);
    await page.waitForLoadState('domcontentloaded');

    await page.evaluate(
      ({ at, rt, authStorage }) => {
        localStorage.setItem('accessToken', at);
        if (rt) localStorage.setItem('refreshToken', rt);
        localStorage.setItem('auth-storage', authStorage);
      },
      { at: accessToken, rt: refreshToken, authStorage: authStorageValue },
    );

    await context.storageState({ path: filePath });
    await context.close();
    await browser.close();
  }

  // --- 일반 사용자 storageState 저장 ---
  await loginViaApiAndSave(
    process.env.TEST_USER_EMAIL || 'testuser@e2e.com',
    process.env.TEST_USER_PASSWORD || 'Test1234!',
    'E2E유저',
    'USER',
    path.join(authDir, 'user.json'),
  );

  // --- 관리자 storageState 저장 ---
  await loginViaApiAndSave(
    process.env.TEST_ADMIN_EMAIL || 'admin@e2e.com',
    process.env.TEST_ADMIN_PASSWORD || 'Admin1234!',
    'E2E관리자',
    'ADMIN',
    path.join(authDir, 'admin.json'),
  );
}

export default globalSetup;
