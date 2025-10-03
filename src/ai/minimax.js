const {
  getAvailableMoves,
  applyMove,
  checkWinner,
  isDraw,
  switchPlayer
} = require('../game');

function minimax(board, currentPlayer, aiPlayer) {
  const winner = checkWinner(board);
  if (winner === aiPlayer) {
    return { score: 1 };
  }
  if (winner && winner !== aiPlayer) {
    return { score: -1 };
  }
  if (isDraw(board)) {
    return { score: 0 };
  }

  const isMaximizing = currentPlayer === aiPlayer;
  let bestScore = isMaximizing ? -Infinity : Infinity;
  let bestMove = null;

  for (const move of getAvailableMoves(board)) {
    const nextBoard = applyMove(board, move, currentPlayer);
    const result = minimax(nextBoard, switchPlayer(currentPlayer), aiPlayer);

    if (isMaximizing) {
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    } else {
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
  }

  return { score: bestScore, move: bestMove };
}

function selectMove(board, player) {
  const { move } = minimax(board, player, player);
  if (move === null || move === undefined) {
    throw new Error('No valid move for minimax AI');
  }
  return move;
}

module.exports = {
  selectMove
};
