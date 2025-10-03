const BOARD_SIZE = 9;

function createEmptyState() {
  return { board: Array(BOARD_SIZE).fill(null) };
}

function currentPlayer(state) {
  const { board } = state;
  const xCount = board.filter((cell) => cell === 'X').length;
  const oCount = board.filter((cell) => cell === 'O').length;

  return xCount <= oCount ? 'X' : 'O';
}

function isCellEmpty(state, index) {
  if (index < 0 || index >= BOARD_SIZE) {
    throw new RangeError('Cell index is out of bounds');
  }
  return state.board[index] === null;
}

function applyMove(state, index) {
  if (!isCellEmpty(state, index)) {
    throw new Error('Cannot apply move to a filled cell');
  }

  const nextBoard = state.board.slice();
  nextBoard[index] = currentPlayer(state);

  return { board: nextBoard };
}

export { createEmptyState, applyMove, currentPlayer, isCellEmpty };
