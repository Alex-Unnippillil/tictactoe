(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TicTacToe = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const BOARD_SIZE = 3;

  function createBoard() {
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(''));
  }

  function cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  function isValidCell(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  }

  function isCellEmpty(board, row, col) {
    return board[row][col] === '';
  }

  function placeMark(board, row, col, player) {
    if (!isValidCell(row, col)) {
      throw new RangeError('Cell is outside the board.');
    }

    if (!player || (player !== 'X' && player !== 'O')) {
      throw new TypeError('Player must be either "X" or "O".');
    }

    if (!isCellEmpty(board, row, col)) {
      throw new Error('Cell is already occupied.');
    }

    const updated = cloneBoard(board);
    updated[row][col] = player;
    return updated;
  }

  function checkWin(board, player) {
    // Check rows and columns
    for (let i = 0; i < BOARD_SIZE; i += 1) {
      if (board[i].every((cell) => cell === player)) {
        return true;
      }

      let columnWin = true;
      for (let j = 0; j < BOARD_SIZE; j += 1) {
        if (board[j][i] !== player) {
          columnWin = false;
          break;
        }
      }
      if (columnWin) {
        return true;
      }
    }

    // Check diagonals
    let mainDiagonalWin = true;
    let antiDiagonalWin = true;
    for (let i = 0; i < BOARD_SIZE; i += 1) {
      if (board[i][i] !== player) {
        mainDiagonalWin = false;
      }
      if (board[i][BOARD_SIZE - 1 - i] !== player) {
        antiDiagonalWin = false;
      }
    }

    return mainDiagonalWin || antiDiagonalWin;
  }

  function checkDraw(board) {
    for (let i = 0; i < BOARD_SIZE; i += 1) {
      for (let j = 0; j < BOARD_SIZE; j += 1) {
        if (board[i][j] === '') {
          return false;
        }
      }
    }

    return !checkWin(board, 'X') && !checkWin(board, 'O');
  }

  function getGameStatus(board, currentPlayer) {
    if (checkWin(board, currentPlayer)) {
      return `${currentPlayer} Wins!`;
    }

    if (checkDraw(board)) {
      return "It's a draw!";
    }

    return null;
  }

  return {
    BOARD_SIZE,
    createBoard,
    placeMark,
    checkWin,
    checkDraw,
    getGameStatus
  };
});
