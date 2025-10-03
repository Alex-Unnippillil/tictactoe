const {
  BOARD_SIZE,
  createBoard,
  placeMark,
  checkWin,
  checkDraw,
  getGameStatus
} = require('../src/tictactoe');

describe('TicTacToe core logic', () => {
  test('createBoard generates an empty 3x3 board', () => {
    const board = createBoard();

    expect(board).toHaveLength(BOARD_SIZE);
    board.forEach((row) => {
      expect(row).toHaveLength(BOARD_SIZE);
      row.forEach((cell) => expect(cell).toBe(''));
    });
  });

  test('placeMark returns a new board without mutating the original', () => {
    const board = createBoard();
    const updated = placeMark(board, 1, 1, 'X');

    expect(updated).not.toBe(board);
    expect(updated[1][1]).toBe('X');
    expect(board[1][1]).toBe('');
  });

  test('placeMark throws an error when the cell is occupied', () => {
    const board = createBoard();
    const firstMove = placeMark(board, 0, 0, 'X');

    expect(() => placeMark(firstMove, 0, 0, 'O')).toThrow('Cell is already occupied.');
  });

  test('placeMark validates the target cell coordinates', () => {
    const board = createBoard();

    expect(() => placeMark(board, -1, 0, 'X')).toThrow(RangeError);
    expect(() => placeMark(board, 3, 3, 'O')).toThrow(RangeError);
  });

  test('placeMark only allows X or O players', () => {
    const board = createBoard();

    expect(() => placeMark(board, 0, 0, '')).toThrow(TypeError);
    expect(() => placeMark(board, 0, 0, 'A')).toThrow(TypeError);
  });

  test('checkWin detects horizontal, vertical, and diagonal wins', () => {
    const horizontalWin = [
      ['X', 'X', 'X'],
      ['', '', ''],
      ['', '', '']
    ];
    const verticalWin = [
      ['O', '', ''],
      ['O', '', ''],
      ['O', '', '']
    ];
    const diagonalWin = [
      ['X', '', 'O'],
      ['', 'X', ''],
      ['O', '', 'X']
    ];

    expect(checkWin(horizontalWin, 'X')).toBe(true);
    expect(checkWin(verticalWin, 'O')).toBe(true);
    expect(checkWin(diagonalWin, 'X')).toBe(true);
  });

  test('checkDraw returns true only when board is full without a winner', () => {
    const drawBoard = [
      ['X', 'O', 'X'],
      ['X', 'O', 'O'],
      ['O', 'X', 'X']
    ];
    const notDraw = [
      ['X', 'O', ''],
      ['', 'X', 'O'],
      ['', '', 'X']
    ];

    expect(checkDraw(drawBoard)).toBe(true);
    expect(checkDraw(notDraw)).toBe(false);
  });

  test('getGameStatus returns appropriate status messages', () => {
    const winningBoard = [
      ['X', 'X', 'X'],
      ['O', 'O', ''],
      ['', '', '']
    ];
    const drawBoard = [
      ['X', 'O', 'X'],
      ['X', 'O', 'O'],
      ['O', 'X', 'X']
    ];
    const inProgressBoard = [
      ['X', 'O', 'X'],
      ['X', 'O', 'O'],
      ['O', '', '']
    ];

    expect(getGameStatus(winningBoard, 'X')).toBe('X Wins!');
    expect(getGameStatus(drawBoard, 'O')).toBe("It's a draw!");
    expect(getGameStatus(inProgressBoard, 'O')).toBeNull();
  });
});
