(function (global) {
  if (!global) {
    throw new Error('Global object not found for TicTacToe AI orchestrator.');
  }

  var LINES = [
    [ [0, 0], [0, 1], [0, 2] ],
    [ [1, 0], [1, 1], [1, 2] ],
    [ [2, 0], [2, 1], [2, 2] ],
    [ [0, 0], [1, 0], [2, 0] ],
    [ [0, 1], [1, 1], [2, 1] ],
    [ [0, 2], [1, 2], [2, 2] ],
    [ [0, 0], [1, 1], [2, 2] ],
    [ [0, 2], [1, 1], [2, 0] ]
  ];

  var strategies = new Map();
  var defaultStrategyId = null;

  function cloneBoard(board) {
    return board.map(function (row) {
      return row.slice();
    });
  }

  function getOpponent(player) {
    return player === 'X' ? 'O' : 'X';
  }

  function isValidBoard(board) {
    if (!Array.isArray(board) || board.length !== 3) {
      return false;
    }

    return board.every(function (row) {
      return Array.isArray(row) && row.length === 3;
    });
  }

  function isCellEmpty(board, row, col) {
    return board[row] && board[row][col] === '';
  }

  function cloneLines() {
    return LINES.map(function (line) {
      return line.slice();
    });
  }

  var helperAPI = {
    getLines: function () {
      return cloneLines();
    },
    cloneBoard: cloneBoard,
    getOpponent: getOpponent,
    isCellEmpty: isCellEmpty
  };

  function validateStrategy(strategy) {
    if (!strategy || typeof strategy !== 'object') {
      throw new Error('Strategy must be an object.');
    }
    if (!strategy.id || typeof strategy.id !== 'string') {
      throw new Error('Strategy id must be a non-empty string.');
    }
    if (typeof strategy.getMove !== 'function') {
      throw new Error('Strategy getMove must be a function.');
    }
  }

  function registerStrategy(strategy) {
    validateStrategy(strategy);

    if (strategies.has(strategy.id)) {
      console.warn('Strategy with id "' + strategy.id + '" is already registered. Overwriting existing strategy.');
    }

    strategies.set(strategy.id, {
      id: strategy.id,
      label: strategy.label || strategy.id,
      getMove: strategy.getMove
    });

    if (!defaultStrategyId) {
      defaultStrategyId = strategy.id;
    }
  }

  function chooseMove(options) {
    options = options || {};
    var board = options.board;
    var player = options.player;
    var strategyId = options.strategyId || defaultStrategyId;
    var opponent = options.opponent || getOpponent(player);

    if (!strategyId || !strategies.has(strategyId)) {
      console.warn('Unknown strategy "' + strategyId + '".');
      return null;
    }

    if (!isValidBoard(board) || !player) {
      console.warn('Invalid board or player supplied to chooseMove.');
      return null;
    }

    var strategy = strategies.get(strategyId);
    var safeBoard = cloneBoard(board);
    var move = strategy.getMove({
      board: safeBoard,
      player: player,
      opponent: opponent,
      helpers: helperAPI
    });

    if (!move) {
      return null;
    }

    var row = move.row;
    var col = move.col;

    if (typeof row !== 'number' || typeof col !== 'number') {
      console.warn('Strategy "' + strategyId + '" returned an invalid move format.');
      return null;
    }

    if (row < 0 || row > 2 || col < 0 || col > 2) {
      console.warn('Strategy "' + strategyId + '" returned an out-of-bounds move.');
      return null;
    }

    if (!isCellEmpty(board, row, col)) {
      console.warn('Strategy "' + strategyId + '" returned a move for an occupied cell.');
      return null;
    }

    return { row: row, col: col };
  }

  function listStrategies() {
    return Array.from(strategies.values()).map(function (strategy) {
      return {
        id: strategy.id,
        label: strategy.label
      };
    });
  }

  function setDefaultStrategyId(strategyId) {
    if (!strategies.has(strategyId)) {
      throw new Error('Unknown strategy id "' + strategyId + '".');
    }

    defaultStrategyId = strategyId;
  }

  function getDefaultStrategyId() {
    return defaultStrategyId;
  }

  function getStrategy(strategyId) {
    return strategies.get(strategyId) || null;
  }

  global.TicTacToeAI = {
    registerStrategy: registerStrategy,
    chooseMove: chooseMove,
    listStrategies: listStrategies,
    setDefaultStrategyId: setDefaultStrategyId,
    getDefaultStrategyId: getDefaultStrategyId,
    getStrategy: getStrategy,
    helpers: helperAPI
  };
})(typeof window !== 'undefined' ? window : null);
