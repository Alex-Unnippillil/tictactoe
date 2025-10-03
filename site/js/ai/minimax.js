(function (global) {
  'use strict';

  var DEFAULT_DEPTH_LIMIT = 9;

  function opponent(player) {
    return player === 'X' ? 'O' : 'X';
  }

  function checkWinner(board) {
    for (var i = 0; i < 3; i++) {
      if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
        return board[i][0];
      }
      if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
        return board[0][i];
      }
    }

    if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
      return board[0][0];
    }

    if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
      return board[0][2];
    }

    return null;
  }

  function evaluateScore(winner, maximizingPlayer, depth) {
    if (winner === maximizingPlayer) {
      return 10 - depth;
    }
    if (winner === opponent(maximizingPlayer)) {
      return depth - 10;
    }
    return 0;
  }

  function minimax(board, currentPlayer, maximizingPlayer, depth, depthLimit, alpha, beta) {
    var winner = checkWinner(board);
    if (winner) {
      return {
        score: evaluateScore(winner, maximizingPlayer, depth),
        move: null
      };
    }

    if (depth >= depthLimit) {
      return {
        score: 0,
        move: null
      };
    }

    var bestMove = null;
    var bestScore = currentPlayer === maximizingPlayer ? -Infinity : Infinity;
    var hasMove = false;

    for (var row = 0; row < 3; row++) {
      for (var col = 0; col < 3; col++) {
        if (board[row][col]) {
          continue;
        }

        hasMove = true;

        board[row][col] = currentPlayer;

        var result = minimax(
          board,
          opponent(currentPlayer),
          maximizingPlayer,
          depth + 1,
          depthLimit,
          alpha,
          beta
        );

        board[row][col] = '';

        if (currentPlayer === maximizingPlayer) {
          if (result.score > bestScore) {
            bestScore = result.score;
            bestMove = { row: row, col: col };
            if (bestScore === 10 - (depth + 1)) {
              return {
                score: bestScore,
                move: bestMove
              };
            }
          }
          alpha = Math.max(alpha, bestScore);
          if (beta <= alpha) {
            return {
              score: bestScore,
              move: bestMove
            };
          }
        } else {
          if (result.score < bestScore) {
            bestScore = result.score;
            bestMove = { row: row, col: col };
            if (bestScore === (depth + 1) - 10) {
              return {
                score: bestScore,
                move: bestMove
              };
            }
          }
          beta = Math.min(beta, bestScore);
          if (beta <= alpha) {
            return {
              score: bestScore,
              move: bestMove
            };
          }
        }
      }
    }

    if (!hasMove) {
      return {
        score: 0,
        move: null
      };
    }

    return {
      score: bestScore,
      move: bestMove
    };
  }

  function ensureBoard(inputBoard) {
    if (!inputBoard) {
      throw new Error('Board must be provided.');
    }

    var board = new Array(3);

    if (Array.isArray(inputBoard) && inputBoard.length === 9) {
      for (var idx = 0; idx < 9; idx++) {
        var rowIndex = Math.floor(idx / 3);
        var colIndex = idx % 3;
        if (!board[rowIndex]) {
          board[rowIndex] = new Array(3);
        }
        board[rowIndex][colIndex] = inputBoard[idx] || '';
      }
      return board;
    }

    if (!Array.isArray(inputBoard) || inputBoard.length !== 3) {
      throw new Error('Board must be a 3x3 array.');
    }

    for (var i = 0; i < 3; i++) {
      if (!Array.isArray(inputBoard[i]) || inputBoard[i].length !== 3) {
        throw new Error('Board must be a 3x3 array.');
      }
      board[i] = new Array(3);
      for (var j = 0; j < 3; j++) {
        board[i][j] = inputBoard[i][j] || '';
      }
    }

    return board;
  }

  function computeBestMove(boardState, player, options) {
    options = options || {};
    var depthLimit = typeof options.depthLimit === 'number' ? options.depthLimit : DEFAULT_DEPTH_LIMIT;
    var board = ensureBoard(boardState);
    var maximizingPlayer = player;

    var result = minimax(board, maximizingPlayer, maximizingPlayer, 0, depthLimit, -Infinity, Infinity);

    if (!result.move) {
      return {
        move: null,
        score: result.score
      };
    }

    return {
      move: result.move,
      score: result.score
    };
  }

  var api = {
    id: 'minimax',
    version: '1.0.0',
    computeBestMove: computeBestMove,
    compute: function (params) {
      if (!params) {
        throw new Error('Parameters are required to compute a move.');
      }

      var board = params.board || params.state;
      var player = params.player || params.currentPlayer;
      var depthLimit = params.depthLimit;

      if (!player) {
        throw new Error('A player symbol ("X" or "O") must be provided.');
      }

      return computeBestMove(board, player, { depthLimit: depthLimit });
    },
    evaluateBoard: function (boardState, player, options) {
      return computeBestMove(boardState, player, options).score;
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  var host = global || (typeof window !== 'undefined' ? window : null);
  if (host) {
    if (!host.TicTacToeAI) {
      host.TicTacToeAI = {};
    }
    host.TicTacToeAI.minimax = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
