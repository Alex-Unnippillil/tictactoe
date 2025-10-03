(function (global) {
  'use strict';

  const PLAYER_X = 'X';
  const PLAYER_O = 'O';
  const PLAYER_SYMBOLS = [PLAYER_X, PLAYER_O];

  const WINNING_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  const api = {
    PLAYER_O,
    PLAYER_SYMBOLS,
    PLAYER_X,
    WINNING_LINES
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    const namespace = (global.tictactoeCore = global.tictactoeCore || {});
    namespace.constants = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
