'use strict';

(function (global) {
  function getEmptyCells(board) {
    const moves = [];
    for (let row = 0; row < board.length; row += 1) {
      for (let col = 0; col < board[row].length; col += 1) {
        if (!board[row][col]) {
          moves.push({ row, col });
        }
      }
    }
    return moves;
  }

  function chooseMove(board, playerSymbol = 'X', opponentSymbol = 'O') {
    const moves = getEmptyCells(board);
    if (!moves.length) {
      return null;
    }
    const index = Math.floor(Math.random() * moves.length);
    return moves[index];
  }

  const api = {
    chooseMove,
    _getEmptyCells: getEmptyCells
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.RandomAI = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
