import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { ApiHelper } from './helpers/api';

/**
 * 전체 테스트 시작 전 1회 실행
 * 1. .auth/ 디렉토리 생성
 * 2. 테스트용 계정 생성 (없으면 회원가입)
 * 3. user / admin 로그인 후 storageState 저장
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

  // --- 일반 사용자 storageState 저장 ---
  const browser = await chromium.launch();

  const userContext = await browser.newContext();
  const userPage = await userContext.newPage();
  await userPage.goto(baseURL);
  // TODO: 로그인 액션 (LoginModal 통해 로그인 후 토큰 저장)
  await userContext.storageState({ path: path.join(authDir, 'user.json') });
  await userContext.close();

  // --- 관리자 storageState 저장 ---
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto(baseURL);
  // TODO: 관리자 로그인 액션
  await adminContext.storageState({ path: path.join(authDir, 'admin.json') });
  await adminContext.close();

  await browser.close();
}

export default globalSetup;
