const { test } = require('node:test');
const assert = require('node:assert/strict');

const MinimaxAI = require('../../site/js/ai/minimax.js');

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function cloneBoard(board) {
  return board.slice();
}

function availableMoves(board) {
  const moves = [];
  for (let index = 0; index < board.length; index += 1) {
    if (board[index] === null) {
      moves.push(index);
    }
  }
  return moves;
}

function applyMove(board, index, player) {
  const next = cloneBoard(board);
  next[index] = player;
  return next;
}

function evaluateBoard(board) {
  for (const [a, b, c] of WINNING_LINES) {
    const value = board[a];
    if (value && value === board[b] && value === board[c]) {
      return value;
    }
  }
  return board.every((cell) => cell !== null) ? 'draw' : null;
}

function boardToMatrix(board) {
  return [0, 1, 2].map((row) =>
    [0, 1, 2].map((col) => {
      const value = board[row * 3 + col];
      return value ? value : '';
    })
  );
}

function minimaxStrategy(board, player) {
  const matrix = boardToMatrix(board);
  const opponent = player === 'X' ? 'O' : 'X';
  const move = MinimaxAI.chooseMove(matrix, player, opponent);
  return move ? move.row * 3 + move.col : null;
}

function createRandomStrategy(rng = Math.random) {
  return function randomStrategy(board) {
    const moves = availableMoves(board);
    if (!moves.length) {
      return null;
    }

    const value = rng();
    const clamped = Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.999999) : 0;
    const choice = Math.floor(clamped * moves.length);
    return moves[choice];
  };
}

function heuristicStrategy(board, player) {
  const opponent = player === 'X' ? 'O' : 'X';
  const moves = availableMoves(board);

  if (!moves.length) {
    return null;
  }

  for (const move of moves) {
    if (evaluateBoard(applyMove(board, move, player)) === player) {
      return move;
    }
  }

  for (const move of moves) {
    if (evaluateBoard(applyMove(board, move, opponent)) === opponent) {
      return move;
    }
  }

  if (moves.includes(4)) {
    return 4;
  }

  const corners = [0, 2, 6, 8];
  for (const corner of corners) {
    if (moves.includes(corner)) {
      return corner;
    }
  }

  return moves[0];
}

function createDeterministicRng(sequence) {
  let index = 0;
  return () => {
    const value = sequence[index] ?? sequence[sequence.length - 1] ?? 0;
    index += 1;
    return value;
  };
}

function simulateGame({
  strategyX,
  strategyO,
  initialBoard = Array(9).fill(null),
  startingPlayer = 'X'
}) {
  let board = cloneBoard(initialBoard);
  let currentPlayer = startingPlayer;
  const history = [];
  let result = evaluateBoard(board);

  while (!result) {
    const strategy = currentPlayer === 'X' ? strategyX : strategyO;
    const move = strategy(cloneBoard(board), currentPlayer, history.slice());

    assert.notStrictEqual(move, undefined, `${currentPlayer} must return a move index`);
    assert.notStrictEqual(move, null, `${currentPlayer} must return a move index`);
    assert.ok(Number.isInteger(move), `${currentPlayer} must return an integer move index`);
    assert.ok(move >= 0 && move < board.length, 'move index must be within bounds');
    assert.strictEqual(board[move], null, 'selected cell must be empty');

    board = applyMove(board, move, currentPlayer);
    history.push({ player: currentPlayer, move });
    result = evaluateBoard(board);
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }

  return { result, history, board };
}

function assertBoardContains(board, expected, message) {
  assert.deepStrictEqual(board, expected, message);
}

test('random mode AI behaviour', async (t) => {
  await t.test('selects only legal moves as the board fills up', () => {
    const rng = createDeterministicRng([0.05, 0.95, 0.4]);
    const randomStrategy = createRandomStrategy(rng);

    let board = [
      'X', null, 'O',
      null, 'X', null,
      'O', null, null
    ];

    const firstMove = randomStrategy(board, 'O');
    assert.ok([1, 3, 5, 7, 8].includes(firstMove));
    board = applyMove(board, firstMove, 'O');

    const secondMove = randomStrategy(board, 'O');
    assert.ok(availableMoves(board).includes(secondMove));
    board = applyMove(board, secondMove, 'O');

    const thirdMove = randomStrategy(board, 'O');
    assert.ok(availableMoves(board).includes(thirdMove));
  });

  await t.test('capitalises on an obvious blunder when RNG favours the winning move', () => {
    const rng = createDeterministicRng([0]);
    const randomStrategy = createRandomStrategy(rng);

    const board = [
      'O', 'O', null,
      'X', 'X', null,
      null, null, null
    ];

    const move = randomStrategy(board, 'O');
    assert.strictEqual(move, 2, 'random mode should take the available winning cell');

    const outcome = evaluateBoard(applyMove(board, move, 'O'));
    assert.strictEqual(outcome, 'O', 'random mode secures the win after the human misplays');
  });
});

test('heuristic mode decision making', async (t) => {
  await t.test('claims the centre square on an empty board', () => {
    const move = heuristicStrategy(Array(9).fill(null), 'X');
    assert.strictEqual(move, 4);
  });

  await t.test('blocks an imminent loss when the opponent threatens three in a row', () => {
    const board = [
      'X', 'X', null,
      null, 'O', null,
      null, null, null
    ];

    const move = heuristicStrategy(board, 'O');
    assert.strictEqual(move, 2, 'heuristic mode should block the horizontal win');
  });

  await t.test('finishes the game when the opponent blunders', () => {
    const board = [
      'O', 'O', null,
      'X', 'X', null,
      null, null, null
    ];

    const move = heuristicStrategy(board, 'O');
    assert.strictEqual(move, 2, 'heuristic mode should play the winning move');

    const outcome = evaluateBoard(applyMove(board, move, 'O'));
    assert.strictEqual(outcome, 'O');
  });

  await t.test('prefers a corner when the centre is unavailable', () => {
    const board = [
      null, null, null,
      null, 'X', null,
      null, null, null
    ];

    const move = heuristicStrategy(board, 'O');
    assert.ok([0, 2, 6, 8].includes(move));
  });
});

test('hard mode minimax AI', async (t) => {
  await t.test('selects the immediate winning move', () => {
    const board = [
      'X', 'X', null,
      'O', 'O', null,
      null, null, null
    ];

    const move = minimaxStrategy(board, 'O');
    assert.strictEqual(move, 5);

    const outcome = evaluateBoard(applyMove(board, move, 'O'));
    assert.strictEqual(outcome, 'O');
  });

  await t.test('never loses against an optimal opponent', () => {
    const { result, board } = simulateGame({
      strategyX: minimaxStrategy,
      strategyO: minimaxStrategy
    });

    assert.strictEqual(result, 'draw');
    assertBoardContains(board, [
      'X', 'X', 'O',
      'O', 'O', 'X',
      'X', 'O', 'X'
    ], 'perfect play should always end in a draw');
  });

  await t.test('converts a random opponent\'s blunder into a win', () => {
    const randomStrategy = createRandomStrategy(
      createDeterministicRng([0.1, 0.7, 0.3, 0.9, 0.2, 0.8, 0.4, 0.6])
    );

    const { result, board, history } = simulateGame({
      strategyX: randomStrategy,
      strategyO: minimaxStrategy
    });

    assert.strictEqual(result, 'O', 'hard mode should secure victory after the blunder');
    assert.strictEqual(history.length >= 5, true, 'game should advance beyond the opening moves');
    assert.strictEqual(board[3], 'O');
    assert.strictEqual(board[4], 'O');
    assert.strictEqual(board[5], 'O');
  });
});
