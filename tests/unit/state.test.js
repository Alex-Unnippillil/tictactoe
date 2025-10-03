const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createEmptyBoard,
  cloneBoard,
  currentPlayer,
} = require('../../site/js/core/state.js');

test('createEmptyBoard returns an empty 3x3 grid of nulls', () => {
  const board = createEmptyBoard();

  assert.strictEqual(Array.isArray(board), true, 'board should be an array');
  assert.strictEqual(board.length, 3, 'board should contain three rows');
  board.forEach((row, rowIndex) => {
    assert.strictEqual(Array.isArray(row), true, `row ${rowIndex} should be an array`);
    assert.strictEqual(row.length, 3, `row ${rowIndex} should contain three cells`);
    row.forEach((cell, cellIndex) => {
      assert.strictEqual(cell, null, `cell ${rowIndex},${cellIndex} should be null`);
    });
  });

  const [firstRow, secondRow, thirdRow] = board;
  assert.notStrictEqual(firstRow, secondRow, 'rows must be different references');
  assert.notStrictEqual(secondRow, thirdRow, 'rows must be different references');
});

test('cloneBoard returns a deep copy and does not mutate the original', () => {
  const board = createEmptyBoard();
  board[0][0] = 'X';
  board[1][1] = 'O';

  const cloned = cloneBoard(board);

  assert.deepStrictEqual(cloned, board, 'clone should match the original board');
  assert.notStrictEqual(cloned, board, 'clone should not reference the original board');
  assert.notStrictEqual(cloned[0], board[0], 'rows should be cloned');

  cloned[0][0] = 'O';
  assert.strictEqual(board[0][0], 'X', 'mutating the clone should not affect the original');
});

test('currentPlayer alternates between X and O based on board occupancy', () => {
  const emptyBoard = createEmptyBoard();
  assert.strictEqual(currentPlayer(emptyBoard), 'X', 'X should start on an empty board');

  const boardAfterX = cloneBoard(emptyBoard);
  boardAfterX[0][0] = 'X';
  assert.strictEqual(currentPlayer(boardAfterX), 'O', 'O should play after X');

  const boardAfterXO = cloneBoard(boardAfterX);
  boardAfterXO[0][1] = 'O';
  assert.strictEqual(currentPlayer(boardAfterXO), 'X', 'X should play after O');

  const boardWithCustomStart = cloneBoard(boardAfterXO);
  boardWithCustomStart[2][2] = 'X';
  assert.strictEqual(
    currentPlayer(boardWithCustomStart, 'O'),
    'O',
    'custom starting player should be honoured when counts are equal'
  );
});
