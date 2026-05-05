import { expect, test } from '@playwright/test';
import { expectScores, expectStatusContains, gotoGame, selectors } from './helpers';

test.describe('Storage restore', () => {
  test('restores saved scores, board position, names, and appearance from localStorage', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('tictactoe:scores', JSON.stringify({ X: 2, O: 1, draw: 3 }));
      localStorage.setItem(
        'tictactoe:game-state',
        JSON.stringify({
          board: ['X', 'O', null, null, 'X', null, null, null, null],
          currentPlayer: 'O',
          isRoundOver: false,
          winningLine: null,
        })
      );
      localStorage.setItem('tictactoe:player-names', JSON.stringify({ X: 'Riley', O: 'Quinn' }));
      localStorage.setItem(
        'tictactoe:appearance',
        JSON.stringify({ theme: 'dark', accent: 'emerald' })
      );
    });

    await gotoGame(page);

    await expectScores(page, { X: 2, O: 1, draw: 3 });
    await expect(page.locator(selectors.nameFor('X'))).toHaveText('Riley');
    await expect(page.locator(selectors.nameFor('O'))).toHaveText('Quinn');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'emerald');

    await expect(page.locator(selectors.cellByIndex(0))).toHaveAttribute('data-value', 'X');
    await expect(page.locator(selectors.cellByIndex(1))).toHaveAttribute('data-value', 'O');
    await expect(page.locator(selectors.cellByIndex(4))).toHaveAttribute('data-value', 'X');
    await expectStatusContains(page, /quinn.*\(o\).*to move/i);

    await page.locator(selectors.cellByIndex(2)).click();
    await expect(page.locator(selectors.cellByIndex(2))).toHaveAttribute('data-value', 'O');
    await expectStatusContains(page, /riley.*\(x\).*to move/i);
  });
});
