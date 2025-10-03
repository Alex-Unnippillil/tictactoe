const { BOARD_SIZE } = require('./state');

const WINNING_LINES = Object.freeze((() => {
  const lines = [];

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    lines.push(Array.from({ length: BOARD_SIZE }, (_, col) => [row, col]));
  }

  for (let col = 0; col < BOARD_SIZE; col += 1) {
    lines.push(Array.from({ length: BOARD_SIZE }, (_, row) => [row, col]));
  }

  lines.push(Array.from({ length: BOARD_SIZE }, (_, index) => [index, index]));
  lines.push(Array.from({ length: BOARD_SIZE }, (_, index) => [index, BOARD_SIZE - index - 1]));

  return lines;
})());

function valueAt(board, position) {
  const [row, col] = position;
  return board[row][col];
}

function hasWinnerOnLine(board, line) {
  const firstMark = valueAt(board, line[0]);
  if (!firstMark) {
    return null;
  }

  const winning = line.every((position) => valueAt(board, position) === firstMark);
  return winning ? { winner: firstMark, line } : null;
}

function findWinner(board) {
  for (const line of WINNING_LINES) {
    const result = hasWinnerOnLine(board, line);
    if (result) {
      return result;
    }
  }
  return null;
}

function isBoardFull(board) {
  return board.every((row) => row.every((cell) => cell));
}

function isDraw(board) {
  return !findWinner(board) && isBoardFull(board);
}

function getGameStatus(board) {
  const winResult = findWinner(board);
  if (winResult) {
    return {
      status: 'win',
      winner: winResult.winner,
      line: winResult.line,
      draw: false,
    };
  }

  if (isBoardFull(board)) {
    return {
      status: 'draw',
      winner: null,
      line: null,
      draw: true,
    };
  }

  return {
    status: 'ongoing',
    winner: null,
    line: null,
    draw: false,
  };
}

module.exports = {
  BOARD_SIZE,
  WINNING_LINES,
  findWinner,
  isDraw,
  isBoardFull,
  getGameStatus,
};
