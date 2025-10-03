const { getAvailableMoves, applyMove, checkWinner } = require('../game');

function selectMove(board, player) {
  const opponent = player === 'X' ? 'O' : 'X';
  const available = getAvailableMoves(board);

  if (available.length === 0) {
    throw new Error('No available moves');
  }

  // Win if possible.
  for (const move of available) {
    const nextBoard = applyMove(board, move, player);
    if (checkWinner(nextBoard) === player) {
      return move;
    }
  }

  // Block opponent win.
  for (const move of available) {
    const nextBoard = applyMove(board, move, opponent);
    if (checkWinner(nextBoard) === opponent) {
      return move;
    }
  }

  // Prefer center.
  if (available.includes(4)) {
    return 4;
  }

  // Prefer corners.
  const corners = [0, 2, 6, 8];
  for (const corner of corners) {
    if (available.includes(corner)) {
      return corner;
    }
  }

  // Fall back to any remaining move.
  return available[0];
}

module.exports = {
  selectMove
};
