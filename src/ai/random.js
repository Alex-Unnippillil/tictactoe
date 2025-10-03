const { getAvailableMoves } = require('../game');

function selectMove(board) {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) {
    throw new Error('No available moves');
  }
  const index = Math.floor(Math.random() * moves.length);
  return moves[index];
}

module.exports = {
  selectMove
};
