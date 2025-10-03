const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function createEmptyBoard() {
  return Array(9).fill(null);
}

function getAvailableMoves(board) {
  return board
    .map((value, index) => (value === null ? index : null))
    .filter((value) => value !== null);
}

function applyMove(board, index, player) {
  if (board[index] !== null) {
    throw new Error(`Cell ${index} is already occupied`);
  }

  const nextBoard = board.slice();
  nextBoard[index] = player;
  return nextBoard;
}

function checkWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function isDraw(board) {
  return checkWinner(board) === null && board.every((cell) => cell !== null);
}

function switchPlayer(player) {
  return player === 'X' ? 'O' : 'X';
}

module.exports = {
  LINES,
  createEmptyBoard,
  getAvailableMoves,
  applyMove,
  checkWinner,
  isDraw,
  switchPlayer
};
