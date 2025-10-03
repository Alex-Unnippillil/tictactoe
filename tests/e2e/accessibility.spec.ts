import { expect, test } from '@playwright/test';

test.describe('Tic Tac Toe accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('grid exposes ARIA roles and descriptive labels', async ({ page }) => {
    const grid = page.getByRole('grid', { name: /tic tac toe board/i });
    await expect(grid).toBeVisible();

    const cells = grid.getByRole('gridcell');
    await expect(cells).toHaveCount(9);

    const handles = await cells.elementHandles();
    for (const handle of handles) {
      const ariaLabel = await handle.getAttribute('aria-label');
      expect(ariaLabel, 'every cell has an aria-label').not.toBeNull();
      expect(ariaLabel).toMatch(/Row \d column \d, (empty|X|O)/);
    }
  });

  test('status live region announces progress and results', async ({ page }) => {
    const status = page.getByRole('status');
    await expect(status).toHaveAttribute('aria-live', /polite/i);
    await expect(status).toHaveText('Current player: X');

    await page.getByRole('gridcell', { name: 'Row 1 column 1, empty' }).click();
    await expect(status).toHaveText('Current player: O');

    await page.getByRole('gridcell', { name: 'Row 2 column 1, empty' }).click();
    await expect(status).toHaveText('Current player: X');

    await page.getByRole('gridcell', { name: 'Row 1 column 2, empty' }).click();
    await expect(status).toHaveText('Current player: O');

    await page.getByRole('gridcell', { name: 'Row 2 column 2, empty' }).click();
    await expect(status).toHaveText('Current player: X');

    await page.getByRole('gridcell', { name: 'Row 1 column 3, empty' }).click();
    await expect(status).toHaveText('X Wins!');
  });
});
