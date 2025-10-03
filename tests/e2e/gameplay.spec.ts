import { test, expect, Page } from '@playwright/test';

const boardCell = (page: Page, row: number, col: number) =>
  page.locator('table.board tr').nth(row).locator('td').nth(col);

const clickSequence = async (
  page: Page,
  moves: Array<[number, number]>
) => {
  for (const [index, [row, col]] of moves.entries()) {
    const cell = boardCell(page, row, col);
    await cell.click();
    const expectedMark = index % 2 === 0 ? 'X' : 'O';
    await expect(cell).toHaveText(expectedMark);
  }
};

test.describe('Tic Tac Toe gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(
      () => typeof (window as any).makeMove === 'function'
    );
  });

  test('human vs human win scenario', async ({ page }) => {
    await clickSequence(page, [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
      [2, 0],
    ]);

    await expect(page.locator('.message')).toHaveText('X Wins!');
  });

  test('human vs human draw scenario', async ({ page }) => {
    await clickSequence(page, [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 1],
      [1, 0],
      [1, 2],
      [2, 1],
      [2, 0],
      [2, 2],
    ]);

    await expect(page.locator('.message')).toHaveText("It's a draw!");
  });

  test('new game resets the board after a completed match', async ({ page }) => {
    await clickSequence(page, [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
      [2, 0],
    ]);

    await expect(page.locator('.message')).toHaveText('X Wins!');

    await page.reload();

    await expect(page.locator('.message')).toHaveText('');

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        await expect(boardCell(page, row, col)).toHaveText('');
      }
    }
  });
});
