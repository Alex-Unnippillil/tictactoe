const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const MinimaxAI = require(path.join(__dirname, '../../site/js/ai/minimax.js'));

function createEmptyBoard() {
  return [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ];
}

test('AI chooses the center on its first move when available', () => {
  const board = createEmptyBoard();

  const move = MinimaxAI.chooseMove(board, 'X', 'O');

  assert.strictEqual(move.row, 1);
  assert.strictEqual(move.col, 1);
  assert.strictEqual(board[1][1], '');
});

test('AI selects a corner on its first move when the center is taken', () => {
  const board = createEmptyBoard();
  board[1][1] = 'O';

  const move = MinimaxAI.chooseMove(board, 'X', 'O');

  const cornerKeys = new Set(['0,0', '0,2', '2,0', '2,2']);
  const chosenKey = `${move.row},${move.col}`;

  assert.ok(cornerKeys.has(chosenKey));
  assert.strictEqual(board[move.row][move.col], '');
});
