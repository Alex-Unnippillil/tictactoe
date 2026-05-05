import { expect, test } from '@playwright/test';
import { expectScores, expectStatusContains, gotoGame, playMoves, readStatus, selectors } from './helpers';

test.describe('Round and score reset flows', () => {
  test('honors confirmation behavior for new round, reset game, and reset scores', async ({ page }) => {
    await gotoGame(page);

    await page.evaluate(() => {
      (window as typeof window & { __confirmQueue?: boolean[] }).__confirmQueue = [];
      window.confirm = () => {
        const queue = (window as typeof window & { __confirmQueue?: boolean[] }).__confirmQueue ?? [];
        return queue.shift() ?? true;
      };
    });

    await playMoves(page, [0, 3, 1, 4, 2]);
    await expectStatusContains(page, /wins/i);
    await expectScores(page, { X: 1, O: 0, draw: 0 });

    await playMoves(page, [8]);
    await expect(page.locator(selectors.cellByIndex(8))).toHaveAttribute('data-value', '');

    await playMoves(page, [0]);
    await page.evaluate(() => {
      (window as typeof window & { __confirmQueue: boolean[] }).__confirmQueue.push(false);
    });
    const boardBeforeCancel = await page.locator(selectors.cellByIndex(0)).getAttribute('data-value');
    await page.locator(selectors.newRoundButton).click();
    await expect(page.locator(selectors.cellByIndex(0))).toHaveAttribute('data-value', boardBeforeCancel ?? 'X');

    await page.evaluate(() => {
      (window as typeof window & { __confirmQueue: boolean[] }).__confirmQueue.push(true);
    });
    await page.locator(selectors.newRoundButton).click();
    await expect(page.locator(selectors.cellByIndex(0))).not.toHaveAttribute('data-value', /X|O/);
    await expectScores(page, { X: 1, O: 0, draw: 0 });
    await expectStatusContains(page, /to move/i);

    await playMoves(page, [0]);
    await page.evaluate(() => {
      (window as typeof window & { __confirmQueue: boolean[] }).__confirmQueue.push(false);
    });
    await page.locator(selectors.resetGameButton).click();
    await expect(page.locator(selectors.cellByIndex(0))).toHaveAttribute('data-value', 'X');
    await expectScores(page, { X: 1, O: 0, draw: 0 });

    await page.evaluate(() => {
      (window as typeof window & { __confirmQueue: boolean[] }).__confirmQueue.push(true);
    });
    await page.locator(selectors.resetGameButton).click();
    await expectScores(page, { X: 0, O: 0, draw: 0 });
    await expectStatusContains(page, /player x.*to move/i);

    await playMoves(page, [0, 1, 3, 4, 6]);
    await expectScores(page, { X: 1, O: 0, draw: 0 });

    await page.evaluate(() => {
      (window as typeof window & { __confirmQueue: boolean[] }).__confirmQueue.push(false);
    });
    await page.locator(selectors.resetScoresButton).click();
    await expectScores(page, { X: 1, O: 0, draw: 0 });

    const statusBeforeScoreReset = await readStatus(page);
    await page.evaluate(() => {
      (window as typeof window & { __confirmQueue: boolean[] }).__confirmQueue.push(true);
    });
    await page.locator(selectors.resetScoresButton).click();
    await expectScores(page, { X: 0, O: 0, draw: 0 });
    await expect.poll(() => readStatus(page)).toBe(statusBeforeScoreReset);
  });
});
