(function (global) {
  const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  const state = {
    board: Array(9).fill(null),
    currentPlayer: "X",
    startingPlayer: "X",
    winner: null,
    moves: 0
  };

  function isValidPlayer(player) {
    return player === "X" || player === "O";
  }

  function reset(options = {}) {
    const { startingPlayer } = options;
    if (startingPlayer && isValidPlayer(startingPlayer)) {
      state.startingPlayer = startingPlayer;
    }

    state.board.fill(null);
    state.currentPlayer = state.startingPlayer;
    state.winner = null;
    state.moves = 0;
  }

  function checkWin(player) {
    return WINNING_COMBINATIONS.some((line) =>
      line.every((index) => state.board[index] === player)
    );
  }

  function makeMove(index) {
    if (index < 0 || index >= state.board.length) {
      return { valid: false, reason: "out-of-range" };
    }

    if (state.board[index] || isGameOver()) {
      return { valid: false, reason: "occupied" };
    }

    state.board[index] = state.currentPlayer;
    state.moves += 1;

    if (checkWin(state.currentPlayer)) {
      state.winner = state.currentPlayer;
      return { valid: true, status: "win", player: state.currentPlayer };
    }

    if (state.moves === state.board.length) {
      return { valid: true, status: "draw" };
    }

    state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";
    return { valid: true, status: "continue", player: state.currentPlayer };
  }

  function getBoard() {
    return state.board.slice();
  }

  function getCurrentPlayer() {
    return state.currentPlayer;
  }

  function getStartingPlayer() {
    return state.startingPlayer;
  }

  function setStartingPlayer(player) {
    if (isValidPlayer(player)) {
      state.startingPlayer = player;
    }
  }

  function getWinner() {
    return state.winner;
  }

  function isGameOver() {
    return state.winner !== null || state.moves === state.board.length;
  }

  function hasActiveGame() {
    return state.moves > 0 && !isGameOver();
  }

  global.gameController = {
    reset,
    makeMove,
    getBoard,
    getCurrentPlayer,
    getStartingPlayer,
    setStartingPlayer,
    getWinner,
    isGameOver,
    hasActiveGame
  };

  reset();
})(window);
