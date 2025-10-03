'use strict';

(function (global) {
  const BOARD_SIZE = 3;

  function cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  function isEmptyCell(value) {
    return value === undefined || value === null || value === '';
  }

  function getEmptyCells(board) {
    const moves = [];
    for (let row = 0; row < board.length; row += 1) {
      for (let col = 0; col < board[row].length; col += 1) {
        if (isEmptyCell(board[row][col])) {
          moves.push({ row, col });
        }
      }
    }
    return moves;
  }

  function checkWinner(board) {
    for (let i = 0; i < BOARD_SIZE; i += 1) {
      const rowValue = board[i][0];
      if (rowValue && board[i][1] === rowValue && board[i][2] === rowValue) {
        return rowValue;
      }
      const colValue = board[0][i];
      if (colValue && board[1][i] === colValue && board[2][i] === colValue) {
        return colValue;
      }
    }

    const diagOneValue = board[0][0];
    if (diagOneValue && board[1][1] === diagOneValue && board[2][2] === diagOneValue) {
      return diagOneValue;
    }

    const diagTwoValue = board[0][2];
    if (diagTwoValue && board[1][1] === diagTwoValue && board[2][0] === diagTwoValue) {
      return diagTwoValue;
    }

    return null;
  }

  function findWinningMove(board, symbol) {
    const clone = cloneBoard(board);
    for (let i = 0; i < BOARD_SIZE; i += 1) {
      for (let j = 0; j < BOARD_SIZE; j += 1) {
        if (!isEmptyCell(clone[i][j])) {
          continue;
        }
        clone[i][j] = symbol;
        if (checkWinner(clone) === symbol) {
          return { row: i, col: j };
        }
        clone[i][j] = '';
      }
    }
    return null;
  }

  function chooseMove(board, playerSymbol = 'X', opponentSymbol = 'O') {
    const winningMove = findWinningMove(board, playerSymbol);
    if (winningMove) {
      return winningMove;
    }

    const blockingMove = findWinningMove(board, opponentSymbol);
    if (blockingMove) {
      return blockingMove;
    }

    if (isEmptyCell(board[1][1])) {
      return { row: 1, col: 1 };
    }

    const corners = [
      { row: 0, col: 0 },
      { row: 0, col: 2 },
      { row: 2, col: 0 },
      { row: 2, col: 2 }
    ];
    for (let index = 0; index < corners.length; index += 1) {
      const move = corners[index];
      if (isEmptyCell(board[move.row][move.col])) {
        return move;
      }
    }

    const sides = [
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 2 },
      { row: 2, col: 1 }
    ];
    for (let index = 0; index < sides.length; index += 1) {
      const move = sides[index];
      if (isEmptyCell(board[move.row][move.col])) {
        return move;
      }
    }

    const fallbackMoves = getEmptyCells(board);
    return fallbackMoves.length ? fallbackMoves[0] : null;
  }

  const api = {
    chooseMove,
    _findWinningMove: findWinningMove,
    _checkWinner: checkWinner,
    _getEmptyCells: getEmptyCells
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.HeuristicAI = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
