import { expect, test } from '@playwright/test';

test.describe('Keyboard play', () => {
  test('allows navigating the grid with arrow keys and announces moves', async ({ page }) => {
    await page.goto('/tictactoe/');

    const board = page.locator('[role="grid"], [data-testid="board"]').first();
    await expect(board).toBeVisible();

    let cells = board.locator('[role="gridcell"]');
    if (await cells.count() === 0) {
      cells = board.locator('[data-testid="cell"]');
    }
    if (await cells.count() === 0) {
      cells = board.locator('[data-cell]');
    }
    if (await cells.count() === 0) {
      cells = board.locator('button').filter({ hasNotText: /reset|new game/i });
    }

    await expect(cells).toHaveCount(9);

    await page.locator('body').click();
    for (let i = 0; i < 10; i++) {
      if (await cells.first().evaluate((element) => element === document.activeElement)) {
        break;
      }
      await page.keyboard.press('Tab');
    }
    await expect(cells.first()).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(cells.nth(1)).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(cells.nth(4)).toBeFocused();

    const liveRegion = page.locator('[aria-live], [role="status"]').first();
    await expect(liveRegion).toBeVisible();

    const readLiveRegion = async () => (await liveRegion.textContent())?.trim() ?? '';
    const initialStatus = await readLiveRegion();

    await page.keyboard.press('Enter');
    await expect.poll(readLiveRegion).not.toBe(initialStatus);

    await expect(cells.nth(4)).toContainText(/x/i);
    const statusAfterFirstMove = await readLiveRegion();
    expect(statusAfterFirstMove).not.toBe('');
    expect(statusAfterFirstMove.toLowerCase()).toContain('o');

    await page.keyboard.press('ArrowLeft');
    await expect(cells.nth(3)).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(cells.nth(3)).toContainText(/o/i);

    await expect.poll(readLiveRegion).not.toBe(statusAfterFirstMove);
    const statusAfterSecondMove = await readLiveRegion();
    expect(statusAfterSecondMove).not.toBe('');
    expect(statusAfterSecondMove.toLowerCase()).toContain('x');
  });
});
