const randomAI = require('../../src/ai/random');
const heuristicAI = require('../../src/ai/heuristic');
const minimaxAI = require('../../src/ai/minimax');
const {
  createEmptyBoard,
  applyMove,
  getAvailableMoves,
  checkWinner
} = require('../../src/game');

describe('Random AI', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('chooses only among available moves', () => {
    const board = ['X', null, 'O', null, 'X', null, 'O', null, null];
    const available = getAvailableMoves(board);

    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const move = randomAI.selectMove(board);
    expect(available).toContain(move);

    // Different random values should still map to available moves.
    jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(available).toContain(randomAI.selectMove(board));
  });

  test('throws when board is full', () => {
    const board = ['X', 'O', 'X', 'X', 'O', 'X', 'O', 'X', 'O'];
    expect(() => randomAI.selectMove(board)).toThrow('No available moves');
  });
});

describe('Heuristic AI', () => {
  test('takes winning move when available', () => {
    const board = ['O', 'O', null, 'X', 'X', null, null, null, null];
    const move = heuristicAI.selectMove(board, 'O');
    expect(move).toBe(2);
  });

  test('blocks opponent winning move', () => {
    const board = ['X', 'X', null, null, 'O', null, null, null, null];
    const move = heuristicAI.selectMove(board, 'O');
    expect(move).toBe(2);
  });

  test('prefers center then corners when no immediate threats', () => {
    const board = ['X', null, null, null, null, null, null, null, 'O'];
    const move = heuristicAI.selectMove(board, 'X');
    expect(move).toBe(4);

    const withoutCenter = ['X', null, null, null, 'X', null, null, null, 'O'];
    const moveWithoutCenter = heuristicAI.selectMove(withoutCenter, 'O');
    expect([0, 2, 6, 8]).toContain(moveWithoutCenter);
  });
});

describe('Minimax AI', () => {
  function playGame({ humanMoves = [], humanStrategy }) {
    let board = createEmptyBoard();
    let winner = null;
    let humanIndex = 0;

    while (!winner && getAvailableMoves(board).length > 0) {
      const humanMove = humanStrategy
        ? humanStrategy(board.slice())
        : (() => {
            while (
              humanIndex < humanMoves.length &&
              board[humanMoves[humanIndex]] !== null
            ) {
              humanIndex++;
            }
            if (humanIndex >= humanMoves.length) {
              throw new Error('No scripted human move available');
            }
            return humanMoves[humanIndex++];
          })();

      if (board[humanMove] !== null) {
        throw new Error(`Human move ${humanMove} is invalid`);
      }
      board = applyMove(board, humanMove, 'X');
      winner = checkWinner(board);
      if (winner || getAvailableMoves(board).length === 0) {
        break;
      }

      const aiMove = minimaxAI.selectMove(board, 'O');
      board = applyMove(board, aiMove, 'O');
      winner = checkWinner(board);
    }

    return { board, winner };
  }

  test('capitalizes on human mistakes to win', () => {
    const { winner } = playGame({
      humanMoves: [0, 8, 1, 3, 2, 6, 5, 7, 4]
    });
    expect(winner).toBe('O');
  });

  test('forces a draw against optimal play', () => {
    const { board, winner } = playGame({
      humanStrategy: (board) => minimaxAI.selectMove(board, 'X')
    });

    expect(winner).toBeNull();
    expect(getAvailableMoves(board)).toHaveLength(0);
  });
});
