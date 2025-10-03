import { expect, test } from '@playwright/test';

test.describe('Keyboard play', () => {
  test('supports winning a round using only the keyboard and announces invalid moves', async ({ page }) => {
    await page.goto('/');

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

    const statusRegion = page.locator('#statusMessage');
    const invalidRegion = page.locator('#invalidMoveMessage');
    const readStatus = async () => (await statusRegion.textContent())?.trim() ?? '';
    const readInvalid = async () => (await invalidRegion.textContent())?.trim() ?? '';

    await page.locator('body').click();
    for (let i = 0; i < 10; i++) {
      if (await cells.first().evaluate((element) => element === document.activeElement)) {
        break;
      }
      await page.keyboard.press('Tab');
    }
    await expect(cells.first()).toBeFocused();

    const initialStatus = await readStatus();

    // Player X marks the top-left cell.
    await page.keyboard.press('Enter');
    await expect(cells.first()).toContainText(/x/i);
    await expect.poll(readStatus).not.toBe(initialStatus);

    // Attempting to play the same cell should trigger an invalid move announcement.
    await page.keyboard.press('Enter');
    await expect.poll(readInvalid).not.toBe('');
    const invalidForOccupied = await readInvalid();
    expect(invalidForOccupied.toLowerCase()).toContain('already');

    // Move focus to an available space for player O and ensure the invalid message clears.
    await page.keyboard.press('ArrowDown');
    await expect(cells.nth(3)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(cells.nth(3)).toContainText(/o/i);
    await expect.poll(readInvalid).toBe('');

    // Player X moves to the centre.
    await page.keyboard.press('ArrowRight');
    await expect(cells.nth(4)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(cells.nth(4)).toContainText(/x/i);

    // Player O moves to the top-right.
    await page.keyboard.press('ArrowLeft');
    await expect(cells.nth(2)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(cells.nth(2)).toContainText(/o/i);

    // Player X finishes the diagonal for the win.
    await page.keyboard.press('ArrowDown');
    await expect(cells.nth(5)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(cells.nth(8)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(cells.nth(8)).toContainText(/x/i);

    await expect.poll(readStatus).toContain('wins');
    await expect(page.locator('[data-role="score"][data-player="X"]')).toHaveText('1');

    // Additional invalid move once the round is over should announce the polite message.
    await page.keyboard.press('Enter');
    await expect.poll(readInvalid).not.toBe('');
    const invalidAfterWin = await readInvalid();
    expect(invalidAfterWin.toLowerCase()).toContain('round');
  });
});
