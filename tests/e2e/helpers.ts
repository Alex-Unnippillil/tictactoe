import { expect, type Locator, type Page } from '@playwright/test';

export const selectors = {
  board: '#board',
  cellByIndex: (index: number) => `[data-cell][data-index="${index}"]`,
  status: '#statusMessage',
  scoreFor: (player: 'X' | 'O' | 'draw') => `[data-role="score"][data-player="${player}"]`,
  nameFor: (player: 'X' | 'O') => `[data-role="name"][data-player="${player}"]`,
  settingsButton: '#settingsButton',
  settingsModal: '#settingsModal',
  settingsForm: '#settingsForm',
  playerXInput: '#playerXName',
  playerOInput: '#playerOName',
  playerXError: '[data-error-for="playerX"]',
  saveSettings: '#settingsForm button[type="submit"]',
  newRoundButton: '#newRoundButton',
  resetGameButton: '#resetGameButton',
  resetScoresButton: '#resetScoresButton',
};

export async function gotoGame(page: Page) {
  await page.goto('/');
  await expect(page.locator(selectors.board)).toBeVisible();
  await expect(page.locator(selectors.status)).toBeVisible();
}

export async function readStatus(page: Page) {
  return ((await page.locator(selectors.status).textContent()) ?? '').trim();
}

export async function expectStatusContains(page: Page, text: RegExp | string) {
  await expect.poll(() => readStatus(page)).toMatch(text instanceof RegExp ? text : new RegExp(text, 'i'));
}

export async function playMoves(page: Page, indexes: number[]) {
  for (const index of indexes) {
    await page.locator(selectors.cellByIndex(index)).click();
  }
}

export async function expectScores(
  page: Page,
  expected: { X: number; O: number; draw: number }
) {
  await expect.poll(async () => ({
    X: Number((await page.locator(selectors.scoreFor('X')).textContent()) ?? '0'),
    O: Number((await page.locator(selectors.scoreFor('O')).textContent()) ?? '0'),
    draw: Number((await page.locator(selectors.scoreFor('draw')).textContent()) ?? '0'),
  })).toEqual(expected);
}

export async function expectDialogVisible(dialog: Locator) {
  await expect.poll(() => dialog.evaluate((node) => (node as HTMLDialogElement).open)).toBe(true);
}

export async function expectDialogClosed(dialog: Locator) {
  await expect.poll(() => dialog.evaluate((node) => (node as HTMLDialogElement).open)).toBe(false);
}
