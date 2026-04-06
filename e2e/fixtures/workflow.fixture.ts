import { test as base, Browser, BrowserContext, Page } from '@playwright/test';
import * as path from 'path';
import { ApiHelper } from '../helpers/api';

/**
 * 워크플로우 테스트 픽스처
 * admin / user / guest 세 가지 컨텍스트를 동시에 관리합니다.
 *
 * 사용 예:
 *   import { workflowTest as test } from '@fixtures/workflow.fixture';
 *   test('WF-A01', async ({ adminPage, userPage, adminApi }) => { ... });
 */

type WorkflowFixtures = {
  /** ADMIN storageState 적용된 페이지 */
  adminPage: Page;
  /** USER storageState 적용된 페이지 */
  userPage: Page;
  /** 비로그인 페이지 */
  guestPage: Page;
  /** admin 토큰 주입 API 헬퍼 */
  adminApi: ApiHelper;
  /** user 토큰 주입 API 헬퍼 */
  userApi: ApiHelper;
  /** admin 토큰 (raw) */
  adminToken: string;
  /** user 토큰 (raw) */
  userToken: string;
};

type WorkflowWorkerFixtures = {
  adminContext: BrowserContext;
  userContext: BrowserContext;
  guestContext: BrowserContext;
};

const BASE_URL = process.env.BASE_URL || 'http://localhost';

export const workflowTest = base.extend<WorkflowFixtures, WorkflowWorkerFixtures>({
  // Worker-scoped contexts — 워커 당 1회만 생성
  adminContext: [
    async ({ browser }: { browser: Browser }, use: (ctx: BrowserContext) => Promise<void>) => {
      const ctx = await browser.newContext({
        storageState: path.join(__dirname, '../.auth/admin.json'),
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
      });
      await use(ctx);
      await ctx.close();
    },
    { scope: 'worker' },
  ],

  userContext: [
    async ({ browser }: { browser: Browser }, use: (ctx: BrowserContext) => Promise<void>) => {
      const ctx = await browser.newContext({
        storageState: path.join(__dirname, '../.auth/user.json'),
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
      });
      await use(ctx);
      await ctx.close();
    },
    { scope: 'worker' },
  ],

  guestContext: [
    async ({ browser }: { browser: Browser }, use: (ctx: BrowserContext) => Promise<void>) => {
      const ctx = await browser.newContext({ locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
      await use(ctx);
      await ctx.close();
    },
    { scope: 'worker' },
  ],

  // Test-scoped pages — 테스트마다 새 페이지
  adminPage: async ({ adminContext }: { adminContext: BrowserContext }, use: (page: Page) => Promise<void>) => {
    const page = await adminContext.newPage();
    await use(page);
    await page.close();
  },

  userPage: async ({ userContext }: { userContext: BrowserContext }, use: (page: Page) => Promise<void>) => {
    const page = await userContext.newPage();
    await use(page);
    await page.close();
  },

  guestPage: async ({ guestContext }: { guestContext: BrowserContext }, use: (page: Page) => Promise<void>) => {
    const page = await guestContext.newPage();
    await use(page);
    await page.close();
  },

  // API 헬퍼 — 토큰은 storageState에서 읽어 주입
  adminToken: async ({ adminContext }: { adminContext: BrowserContext }, use: (token: string) => Promise<void>) => {
    const state = await adminContext.storageState();
    const origin = state.origins.find((o) => o.origin.includes('localhost'));
    const authStorage = origin?.localStorage.find((kv) => kv.name === 'auth-storage');
    let token = '';
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage.value);
        token = parsed?.state?.accessToken || '';
      } catch { /* ignore */ }
    }
    // fallback: accessToken key
    if (!token) {
      const at = origin?.localStorage.find((kv) => kv.name === 'accessToken');
      token = at?.value || '';
    }
    await use(token);
  },

  userToken: async ({ userContext }: { userContext: BrowserContext }, use: (token: string) => Promise<void>) => {
    const state = await userContext.storageState();
    const origin = state.origins.find((o) => o.origin.includes('localhost'));
    const authStorage = origin?.localStorage.find((kv) => kv.name === 'auth-storage');
    let token = '';
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage.value);
        token = parsed?.state?.accessToken || '';
      } catch { /* ignore */ }
    }
    if (!token) {
      const at = origin?.localStorage.find((kv) => kv.name === 'accessToken');
      token = at?.value || '';
    }
    await use(token);
  },

  adminApi: async ({ adminToken }: { adminToken: string }, use: (api: ApiHelper) => Promise<void>) => {
    const api = new ApiHelper(BASE_URL, adminToken);
    await use(api);
  },

  userApi: async ({ userToken }: { userToken: string }, use: (api: ApiHelper) => Promise<void>) => {
    const api = new ApiHelper(BASE_URL, userToken);
    await use(api);
  },
});

export { expect } from '@playwright/test';
