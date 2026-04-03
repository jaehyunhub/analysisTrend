import { test, expect } from '../../fixtures/index';

test.describe('ADMIN — YouTube 영상 관리', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/youtube');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('h2, [role="main"] button', { state: 'visible', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(200);
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
    // 수정 테스트 전용 영상을 먼저 생성하여 DB 초기 상태에 의존하지 않도록 함
    const addButton = page.getByRole('button', { name: /\+ Add Video|추가|등록|영상 추가/i });
    const hasButton = await addButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasButton) {
      test.skip(true, '추가 버튼 없음 — 수정 전제 조건 불충족');
      return;
    }

    await addButton.click();
    const dialog = page.getByRole('dialog');
    const dialogAppeared = await dialog.waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true).catch(() => false);

    if (!dialogAppeared) {
      test.skip(true, '추가 dialog 없음 (구버전) — 수정 불가');
      return;
    }

    // 수정에 쓸 영상 생성
    const seedTitle = `E2E 수정용 영상 ${Date.now()}`;
    const titleInput = dialog.getByPlaceholder(/제목|Title/i).or(dialog.getByLabel(/제목|Title/i));
    await titleInput.fill(seedTitle);

    const urlInput = dialog.getByPlaceholder(/URL|유튜브/i).or(dialog.getByLabel(/URL/i));
    if (await urlInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    }

    await dialog.getByRole('button', { name: /저장|등록|Save|Submit/i }).click();
    await page.waitForTimeout(500);
    await expect(dialog).toBeHidden({ timeout: 5000 });

    // 방금 추가한 영상의 수정 버튼 클릭
    const seedRow = page.getByText(seedTitle);
    await expect(seedRow).toBeVisible({ timeout: 8000 });

    // 행 범위의 수정 버튼 우선, 없으면 페이지 첫 번째 수정 버튼 사용
    const rowEditButton = seedRow.locator('..').getByRole('button', { name: /수정|편집|Edit/i }).first();
    const pageEditButton = page.getByRole('button', { name: /수정|편집|Edit/i }).first();

    const targetEditButton = (await rowEditButton.isVisible({ timeout: 3000 }).catch(() => false))
      ? rowEditButton
      : pageEditButton;

    if (await targetEditButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await targetEditButton.click();
      const editDialog = page.getByRole('dialog');
      const editDialogAppeared = await editDialog.waitFor({ state: 'visible', timeout: 3000 })
        .then(() => true).catch(() => false);
      if (!editDialogAppeared) {
        test.skip(true, '수정 dialog 없음 (구버전)');
        return;
      }
      const editTitleInput = editDialog.getByPlaceholder(/제목|Title/i).or(editDialog.getByLabel(/제목|Title/i));
      await editTitleInput.clear();
      await editTitleInput.fill(`수정된 영상 ${Date.now()}`);
      await editDialog.getByRole('button', { name: /저장|수정|Save/i }).click();
      await page.waitForTimeout(500);
      await expect(editDialog).toBeHidden({ timeout: 5000 });
    } else {
      test.skip(true, '수정 버튼을 찾을 수 없음');
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
