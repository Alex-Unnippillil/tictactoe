const test = require('node:test');
const assert = require('node:assert/strict');

const { createHistory } = require('../../site/js/core/history.js');

function createBoardState(turn = 'X', placements = []) {
  const size = 3;
  const board = Array.from({ length: size }, () => Array(size).fill(''));

  placements.forEach(({ row, col, value }) => {
    board[row][col] = value;
  });

  return {
    board,
    currentPlayer: turn,
    winner: null,
    moveCount: placements.length,
  };
}

test('undo returns the previous state without mutating history', () => {
  const initial = createBoardState('X');
  const history = createHistory(initial);

  const afterFirstMove = createBoardState('O', [
    { row: 0, col: 0, value: 'X' },
  ]);
  const afterSecondMove = createBoardState('X', [
    { row: 0, col: 0, value: 'X' },
    { row: 1, col: 1, value: 'O' },
  ]);

  history.push(afterFirstMove);
  history.push(afterSecondMove);

  const undone = history.undo();
  assert.deepStrictEqual(undone, afterFirstMove);
  assert.deepStrictEqual(history.getCurrent(), afterFirstMove);

  undone.board[0][0] = 'O';
  assert.strictEqual(history.getCurrent().board[0][0], 'X');
  assert.strictEqual(afterFirstMove.board[0][0], 'X');
});

test('redo restores a state that was previously undone', () => {
  const initial = createBoardState('X');
  const history = createHistory(initial);

  const afterFirstMove = createBoardState('O', [
    { row: 0, col: 0, value: 'X' },
  ]);
  const afterSecondMove = createBoardState('X', [
    { row: 0, col: 0, value: 'X' },
    { row: 1, col: 1, value: 'O' },
  ]);

  history.push(afterFirstMove);
  history.push(afterSecondMove);
  history.undo();

  assert.ok(history.canRedo());

  const redone = history.redo();
  assert.deepStrictEqual(redone, afterSecondMove);
  assert.deepStrictEqual(history.getCurrent(), afterSecondMove);

  redone.board[1][1] = 'X';
  assert.strictEqual(history.getCurrent().board[1][1], 'O');
  assert.strictEqual(afterSecondMove.board[1][1], 'O');
});

test('pushing a new state after undo clears the redo stack', () => {
  const initial = createBoardState('X');
  const history = createHistory(initial);

  const afterFirstMove = createBoardState('O', [
    { row: 0, col: 0, value: 'X' },
  ]);
  const afterSecondMove = createBoardState('X', [
    { row: 0, col: 0, value: 'X' },
    { row: 1, col: 1, value: 'O' },
  ]);
  const alternateSecondMove = createBoardState('X', [
    { row: 0, col: 0, value: 'X' },
    { row: 0, col: 1, value: 'O' },
  ]);

  history.push(afterFirstMove);
  history.push(afterSecondMove);

  history.undo();
  assert.ok(history.canRedo());

  history.push(alternateSecondMove);
  assert.ok(!history.canRedo());
  assert.deepStrictEqual(history.getCurrent(), alternateSecondMove);
});
