import { expect, test } from '@playwright/test';
import { expectDialogClosed, expectDialogVisible, gotoGame, selectors } from './helpers';

test.describe('Settings persistence and validation', () => {
  test('blocks save for invalid names and persists valid names/theme/accent after reload', async ({
    page,
  }) => {
    await gotoGame(page);

    const dialog = page.locator(selectors.settingsModal);
    await page.locator(selectors.settingsButton).click();
    await expectDialogVisible(dialog);

    await page.locator(selectors.playerXInput).fill('Invalid@Name');
    await page.locator(selectors.playerOInput).fill('Valid Name');
    await page.locator(selectors.saveSettings).click();

    const xError = page.locator(selectors.playerXError);
    await expect(xError).toBeVisible();
    await expect(xError).toContainText(/letters|numbers|hyphens|periods/i);
    await expectDialogVisible(dialog);

    await expect(page.locator(selectors.nameFor('X'))).toHaveText('Player X');

    await page.locator(selectors.playerXInput).fill('Alex');
    await page.locator('input[name="theme"][value="dark"]').check();
    await page.locator('input[name="accent"][value="rose"]').check();
    await page.locator(selectors.saveSettings).click();
    await expectDialogClosed(dialog);

    await expect(page.locator(selectors.nameFor('X'))).toHaveText('Alex');
    await expect(page.locator(selectors.nameFor('O'))).toHaveText('Valid Name');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'rose');

    await page.reload();
    await gotoGame(page);

    await expect(page.locator(selectors.nameFor('X'))).toHaveText('Alex');
    await expect(page.locator(selectors.nameFor('O'))).toHaveText('Valid Name');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'rose');
  });
});
