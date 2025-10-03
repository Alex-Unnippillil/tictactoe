'use strict';

(function (global) {
  const BOARD_SIZE = 3;
  const PLAYER_X = 'X';
  const PLAYER_O = 'O';

  function createEmptyBoard() {
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
  }

  function cloneBoard(board) {
    if (!Array.isArray(board)) {
      throw new TypeError('Board must be an array');
    }
    return board.map((row) => {
      if (!Array.isArray(row)) {
        throw new TypeError('Board rows must be arrays');
      }
      return row.slice();
    });
  }

  function currentPlayer(board, startingPlayer = PLAYER_X) {
    const opponent = startingPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    let startingCount = 0;
    let opponentCount = 0;

    for (let r = 0; r < board.length; r += 1) {
      const row = board[r];
      if (!Array.isArray(row)) {
        continue;
      }
      for (let c = 0; c < row.length; c += 1) {
        const cell = row[c];
        if (cell === startingPlayer) {
          startingCount += 1;
        } else if (cell === opponent) {
          opponentCount += 1;
        }
      }
    }

    if (startingCount <= opponentCount) {
      return startingPlayer;
    }
    return opponent;
  }

  const api = {
    createEmptyBoard,
    cloneBoard,
    currentPlayer
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.TicTacToe = global.TicTacToe || {};
    global.TicTacToe.state = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
