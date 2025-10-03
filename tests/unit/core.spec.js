const path = require('path');

const state = require(path.join(__dirname, '../../site/js/core/state'));
const rules = require(path.join(__dirname, '../../site/js/core/rules'));

const markBoard = (board, marks) => {
  marks.forEach(([row, col, value]) => {
    board[row][col] = value;
  });
  return board;
};

describe('core/state', () => {
  it('creates an empty board with the expected dimensions', () => {
    const gameState = state.createState();
    expect(gameState.board).toHaveLength(state.BOARD_SIZE);
    gameState.board.forEach((row) => {
      expect(row).toHaveLength(state.BOARD_SIZE);
      row.forEach((cell) => expect(cell).toBeNull());
    });
    expect(gameState.currentPlayer).toBe(state.PLAYERS[0]);
    expect(gameState.moves).toBe(0);
  });

  it('clones overrides when creating a state snapshot', () => {
    const board = state.createEmptyBoard();
    board[0][0] = 'X';

    const snapshot = state.createState({ board, currentPlayer: 'O', moves: 5 });

    expect(snapshot.board).not.toBe(board);
    expect(snapshot.board[0][0]).toBe('X');
    expect(snapshot.currentPlayer).toBe('O');
    expect(snapshot.moves).toBe(5);

    board[0][0] = 'O';
    expect(snapshot.board[0][0]).toBe('X');
  });

  it('allows a legal move and switches players', () => {
    const initial = state.createState();
    const updated = state.applyMove(initial, [1, 1]);

    expect(initial.board[1][1]).toBeNull();
    expect(updated.board[1][1]).toBe(initial.currentPlayer);
    expect(updated.currentPlayer).toBe(state.togglePlayer(initial.currentPlayer));
    expect(updated.moves).toBe(initial.moves + 1);
  });

  it('rejects moves to occupied cells', () => {
    const initial = state.createState();
    const afterFirstMove = state.applyMove(initial, [0, 0]);

    expect(() => state.applyMove(afterFirstMove, [0, 0])).toThrow('Cell is already occupied');
  });

  it('rejects invalid positions regardless of type or range', () => {
    const initial = state.createState();

    expect(() => state.applyMove(initial, [-1, 0])).toThrow(RangeError);
    expect(() => state.applyMove(initial, [0, 3])).toThrow(RangeError);
    expect(() => state.applyMove(initial, ['0', 0])).toThrow(RangeError);
    expect(() => state.applyMove(initial, [1])).toThrow(RangeError);
    expect(() => state.applyMove(initial, '0,0')).toThrow(RangeError);
  });

  it('reports whether a cell is empty without mutating state', () => {
    const initial = state.createState();
    const next = state.applyMove(initial, [2, 2]);

    expect(state.isCellEmpty(initial, [2, 2])).toBe(true);
    expect(state.isCellEmpty(next, [2, 2])).toBe(false);
    expect(initial.board[2][2]).toBeNull();
  });

  it('toggles between the only two supported players', () => {
    expect(state.togglePlayer('X')).toBe('O');
    expect(state.togglePlayer('O')).toBe('X');
  });
});

describe('core/rules', () => {
  it('identifies every winning line for the appropriate player', () => {
    const { BOARD_SIZE, WINNING_LINES, findWinner } = rules;

    WINNING_LINES.forEach((line, index) => {
      const board = state.createEmptyBoard();
      markBoard(board, line.map(([row, col]) => [row, col, index % 2 === 0 ? 'X' : 'O']));
      // Fill an additional square to ensure only the intended line is evaluated.
      const [extraRow, extraCol] = line[0][0] === 0 && line[0][1] === 0
        ? [BOARD_SIZE - 1, BOARD_SIZE - 1]
        : [0, 0];
      if (!line.some(([row, col]) => row === extraRow && col === extraCol)) {
        board[extraRow][extraCol] = 'X';
      }

      const result = findWinner(board);
      expect(result).not.toBeNull();
      expect(result.winner).toBe(index % 2 === 0 ? 'X' : 'O');
      expect(result.line).toEqual(line);
    });
  });

  it('does not report a winner for incomplete or mixed lines', () => {
    const board = markBoard(state.createEmptyBoard(), [
      [0, 0, 'X'],
      [0, 1, 'O'],
    ]);

    expect(rules.findWinner(board)).toBeNull();
  });

  it('surfaces the winning line and player in the game status payload', () => {
    const [targetLine] = rules.WINNING_LINES;
    const board = state.createEmptyBoard();
    markBoard(board, targetLine.map(([row, col]) => [row, col, 'X']));

    const status = rules.getGameStatus(board);
    expect(status).toEqual({
      status: 'win',
      winner: 'X',
      line: targetLine,
      draw: false,
    });
  });

  it('detects a draw only when the board is full and there is no winner', () => {
    const drawBoard = markBoard(state.createEmptyBoard(), [
      [0, 0, 'X'], [0, 1, 'O'], [0, 2, 'X'],
      [1, 0, 'X'], [1, 1, 'O'], [1, 2, 'O'],
      [2, 0, 'O'], [2, 1, 'X'], [2, 2, 'X'],
    ]);

    expect(rules.isBoardFull(drawBoard)).toBe(true);
    expect(rules.isDraw(drawBoard)).toBe(true);
    expect(rules.getGameStatus(drawBoard)).toEqual({
      status: 'draw',
      winner: null,
      line: null,
      draw: true,
    });
  });

  it('reports ongoing games when there is no winner yet', () => {
    const board = markBoard(state.createEmptyBoard(), [
      [0, 0, 'X'],
      [1, 1, 'O'],
    ]);

    expect(rules.isBoardFull(board)).toBe(false);
    expect(rules.findWinner(board)).toBeNull();
    expect(rules.isDraw(board)).toBe(false);
    expect(rules.getGameStatus(board)).toEqual({
      status: 'ongoing',
      winner: null,
      line: null,
      draw: false,
    });
  });
});
