const test = require('node:test');
const assert = require('node:assert/strict');

const domain = require('../../site/js/state/game-domain.js');
const storage = require('../../site/js/state/game-storage.js');

test('evaluateBoard detects wins and draws', () => {
  const win = domain.evaluateBoard(['X', 'X', 'X', null, null, null, null, null, null]);
  assert.strictEqual(win.winner, 'X');
  assert.deepStrictEqual(win.line, [0, 1, 2]);

  const draw = domain.evaluateBoard(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']);
  assert.strictEqual(draw.isDraw, true);
});

test('sanitiseStoredGameState normalises malformed values', () => {
  const state = storage.sanitiseStoredGameState({
    board: ['X', 'bad', 'O', 3, null, undefined, 'X', 'O', 'X'],
    currentPlayer: 'Z',
    isRoundOver: 'yes',
    winningLine: [0, '1', 2, 9],
  });

  assert.deepStrictEqual(state.board, ['X', null, 'O', null, null, null, 'X', 'O', 'X']);
  assert.strictEqual(state.currentPlayer, 'X');
  assert.strictEqual(state.isRoundOver, true);
  assert.deepStrictEqual(state.winningLine, [0, 2, 9]);
});

test('next round starter alternates between players', () => {
  assert.strictEqual(domain.nextRoundStarter('X'), 'O');
  assert.strictEqual(domain.nextRoundStarter('O'), 'X');
});
