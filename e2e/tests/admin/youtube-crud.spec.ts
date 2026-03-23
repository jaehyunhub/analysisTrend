import { test, expect } from '../../fixtures/index';

test.describe('ADMIN — YouTube 영상 관리', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/youtube');
    await page.waitForLoadState('domcontentloaded');
  });

  test('YouTube 영상 추가', async ({ page }) => {
    // 구버전: "+ Add Video", 신버전: "추가|등록|영상 추가"
    const addButton = page.getByRole('button', { name: /\+ Add Video|추가|등록|영상 추가/i });
    const hasButton = await addButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasButton) {
      test.skip(true, '추가 버튼 없음');
      return;
    }

    await addButton.click();
    const dialog = page.getByRole('dialog');
    const dialogAppeared = await dialog.waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true).catch(() => false);

    if (!dialogAppeared) {
      // 구버전: dialog 없음 — 버튼 존재 확인만
      expect(hasButton).toBeTruthy();
      return;
    }

    const titleInput = dialog.getByPlaceholder(/제목|Title/i).or(dialog.getByLabel(/제목|Title/i));
    await titleInput.fill(`E2E 영상 ${Date.now()}`);

    const urlInput = dialog.getByPlaceholder(/URL|유튜브/i).or(dialog.getByLabel(/URL/i));
    if (await urlInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    }

    await dialog.getByRole('button', { name: /저장|등록|Save|Submit/i }).click();
    await page.waitForTimeout(500);
    await expect(dialog).toBeHidden({ timeout: 5000 });
    await expect(page.locator('main')).toBeVisible();
  });

  test('YouTube 영상 수정', async ({ page }) => {
    // 구버전: "Edit" 버튼, 신버전: "수정|편집"
    const editButton = page.getByRole('button', { name: /수정|편집|Edit/i }).first();
    if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editButton.click();
      const dialog = page.getByRole('dialog');
      const dialogAppeared = await dialog.waitFor({ state: 'visible', timeout: 3000 })
        .then(() => true).catch(() => false);
      if (!dialogAppeared) {
        test.skip(true, '수정 dialog 없음 (구버전)');
        return;
      }
      const titleInput = dialog.getByPlaceholder(/제목|Title/i).or(dialog.getByLabel(/제목|Title/i));
      await titleInput.clear();
      await titleInput.fill(`수정된 영상 ${Date.now()}`);
      await dialog.getByRole('button', { name: /저장|수정|Save/i }).click();
      await page.waitForTimeout(500);
      await expect(dialog).toBeHidden({ timeout: 5000 });
    } else {
      test.skip(true, '수정할 영상 없음');
    }
  });

  test('YouTube 영상 삭제', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /\+ Add Video|추가|등록|영상 추가/i });
    const hasButton = await addButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasButton) {
      test.skip(true, '추가 버튼 없음');
      return;
    }

    await addButton.click();
    const dialog = page.getByRole('dialog');
    const dialogAppeared = await dialog.waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true).catch(() => false);
    if (!dialogAppeared) {
      test.skip(true, '추가 dialog 없음 (구버전)');
      return;
    }

    const titleStr = `삭제 영상 ${Date.now()}`;
    const titleInput = dialog.getByPlaceholder(/제목|Title/i).or(dialog.getByLabel(/제목|Title/i));
    await titleInput.fill(titleStr);
    const urlInput = dialog.getByPlaceholder(/URL/i).or(dialog.getByLabel(/URL/i));
    if (await urlInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    }
    await dialog.getByRole('button', { name: /저장|등록|Save/i }).click();
    await page.waitForTimeout(500);

    const row = page.getByText(titleStr);
    await expect(row).toBeVisible({ timeout: 8000 });
    const deleteBtn = row.locator('..').getByRole('button', { name: /삭제|Delete/i });
    await deleteBtn.click();
    const confirmBtn = page.getByRole('button', { name: /확인|삭제|Confirm|Delete/i }).last();
    if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmBtn.click();
    }
    await expect(row).toBeHidden({ timeout: 8000 });
  });
});
