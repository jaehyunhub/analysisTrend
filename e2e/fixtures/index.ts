import { mergeTests } from '@playwright/test';
import { authTest } from './auth.fixture';
import { communityTest } from './community.fixture';

/**
 * 통합 픽스처 export
 * 모든 테스트 파일에서 이 test를 import해서 사용합니다.
 *
 * import { test, expect } from '@fixtures/index';
 */
export const test = mergeTests(authTest, communityTest);
export { expect } from '@playwright/test';
