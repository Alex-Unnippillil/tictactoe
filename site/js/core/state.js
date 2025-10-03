const BOARD_SIZE = 3;
const PLAYERS = Object.freeze(['X', 'O']);

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function cloneBoard(board) {
  return board.map((row) => row.slice());
}

function createState(overrides = {}) {
  const board = overrides.board ? cloneBoard(overrides.board) : createEmptyBoard();
  const currentPlayer = overrides.currentPlayer || PLAYERS[0];
  const moves = overrides.moves != null ? overrides.moves : 0;

  return {
    board,
    currentPlayer,
    moves,
  };
}

function isValidPosition(position) {
  if (!Array.isArray(position) || position.length !== 2) {
    return false;
  }

  const [row, col] = position;
  return Number.isInteger(row) && Number.isInteger(col) && row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function ensureValidPosition(position) {
  if (!isValidPosition(position)) {
    throw new RangeError('Position is outside the bounds of the board');
  }
}

function getCell(state, position) {
  ensureValidPosition(position);
  const [row, col] = position;
  return state.board[row][col];
}

function isCellEmpty(state, position) {
  return getCell(state, position) == null;
}

function togglePlayer(player) {
  return player === PLAYERS[0] ? PLAYERS[1] : PLAYERS[0];
}

function applyMove(state, position) {
  ensureValidPosition(position);

  if (!isCellEmpty(state, position)) {
    throw new Error('Cell is already occupied');
  }

  const [row, col] = position;
  const nextBoard = cloneBoard(state.board);
  nextBoard[row][col] = state.currentPlayer;

  return {
    board: nextBoard,
    currentPlayer: togglePlayer(state.currentPlayer),
    moves: state.moves + 1,
  };
}

module.exports = {
  BOARD_SIZE,
  PLAYERS,
  createEmptyBoard,
  createState,
  cloneBoard,
  isValidPosition,
  getCell,
  isCellEmpty,
  applyMove,
  togglePlayer,
};
