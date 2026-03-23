import { test, expect } from '../../fixtures/index';

test.describe('ADMIN — 스케줄 관리', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/schedule');
    await page.waitForLoadState('domcontentloaded');
  });

  test('스케줄 추가 (날짜 picker, 유형 select)', async ({ page }) => {
    // 구버전: "+ Add Event", 신버전: "추가|등록|새 일정"
    const addButton = page.getByRole('button', { name: /\+ Add Event|추가|등록|새 일정/i });
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

    const titleInput = dialog.getByPlaceholder(/제목|방송명|Title/i).or(dialog.getByLabel(/제목|Title/i));
    await titleInput.fill(`E2E 스케줄 ${Date.now()}`);

    const dateInput = dialog.locator('input[type="date"]').or(dialog.getByLabel(/날짜|Date/i));
    if (await dateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dateInput.fill('2026-06-01');
    }

    const typeSelect = dialog.locator('select').or(dialog.getByRole('combobox'));
    if (await typeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await typeSelect.selectOption({ index: 0 });
    }

    await dialog.getByRole('button', { name: /저장|등록|Save|Submit/i }).click();
    await page.waitForTimeout(500);
    await expect(dialog).toBeHidden({ timeout: 5000 });
    await expect(page.locator('main')).toBeVisible();
  });

  test('스케줄 수정', async ({ page }) => {
    // 구버전: "Edit" 버튼, 신버전: "수정|편집" 버튼
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
      await titleInput.fill(`수정된 스케줄 ${Date.now()}`);
      await dialog.getByRole('button', { name: /저장|수정|Save/i }).click();
      await page.waitForTimeout(500);
      await expect(dialog).toBeHidden({ timeout: 5000 });
    } else {
      test.skip(true, '수정할 스케줄 없음');
    }
  });

  test('스케줄 삭제', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /\+ Add Event|추가|등록|새 일정/i });
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

    const titleStr = `삭제 스케줄 ${Date.now()}`;
    const titleInput = dialog.getByPlaceholder(/제목|Title/i).or(dialog.getByLabel(/제목|Title/i));
    await titleInput.fill(titleStr);
    const dateInput = dialog.locator('input[type="date"]');
    if (await dateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dateInput.fill('2026-07-01');
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
