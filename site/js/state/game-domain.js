'use strict';

(function (global) {
  const fallbackConstants = {
    PLAYER_X: 'X',
    PLAYER_O: 'O',
    WINNING_LINES: [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ],
  };

  const constants =
    (global.tictactoeCore && global.tictactoeCore.constants) || fallbackConstants;
  const PLAYER_X = constants.PLAYER_X || 'X';
  const PLAYER_O = constants.PLAYER_O || 'O';
  const PLAYER_SYMBOLS = [PLAYER_X, PLAYER_O];
  const WINNING_LINES = constants.WINNING_LINES || fallbackConstants.WINNING_LINES;

  const cloneBoard = (board) => board.slice();

  function evaluateBoard(board) {
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line };
      }
    }

    if (board.every((cell) => cell)) {
      return { winner: null, line: null, isDraw: true };
    }

    return { winner: null, line: null, isDraw: false };
  }

  function applyMove(board, index, player) {
    if (!Array.isArray(board) || index < 0 || index > 8 || board[index]) {
      return { board: cloneBoard(board), played: false };
    }

    const nextBoard = cloneBoard(board);
    nextBoard[index] = player;
    return { board: nextBoard, played: true };
  }

  function determineRoundTransition(currentPlayer, boardEvaluation) {
    if (boardEvaluation.winner) {
      return { isRoundOver: true, winningLine: boardEvaluation.line, nextPlayer: currentPlayer };
    }

    if (boardEvaluation.isDraw) {
      return { isRoundOver: true, winningLine: null, nextPlayer: currentPlayer };
    }

    const nextPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    return { isRoundOver: false, winningLine: null, nextPlayer };
  }

  function nextRoundStarter(currentStarter) {
    return currentStarter === PLAYER_X ? PLAYER_O : PLAYER_X;
  }

  const api = {
    PLAYER_X,
    PLAYER_O,
    PLAYER_SYMBOLS,
    WINNING_LINES,
    cloneBoard,
    evaluateBoard,
    applyMove,
    determineRoundTransition,
    nextRoundStarter,
  };

  global.tictactoeGameDomain = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
