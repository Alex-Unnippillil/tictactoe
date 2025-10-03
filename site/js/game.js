'use strict';

(function (global) {
  const stateModule =
    typeof module !== 'undefined' && module.exports
      ? require('./core/state.js')
      : (global.TicTacToe && global.TicTacToe.state);

  if (!stateModule) {
    throw new Error('State helpers are not available');
  }

  const { createEmptyBoard, cloneBoard, currentPlayer } = stateModule;

  function createInitialState() {
    const initialBoard = createEmptyBoard();
    return {
      board: initialBoard,
      history: [cloneBoard(initialBoard)],
      get currentPlayer() {
        return currentPlayer(this.board);
      }
    };
  }

  const gameState = createInitialState();

  function resetGame() {
    const nextBoard = createEmptyBoard();
    gameState.board = nextBoard;
    gameState.history = [cloneBoard(nextBoard)];
  }

  const api = {
    state: gameState,
    reset: resetGame
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.TicTacToe = global.TicTacToe || {};
    global.TicTacToe.game = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
