'use strict';

(function (global) {
  const constants =
    typeof module !== 'undefined' && module.exports
      ? require('../core/constants')
      : (global.tictactoeCore && global.tictactoeCore.constants) || {};

  const PLAYER_X = constants.PLAYER_X || 'X';
  const PLAYER_O = constants.PLAYER_O || 'O';

  const LOG_PREFIX = '[minimax]';

  const stateCache = new Map();
  let cacheHits = 0;
  let cacheMisses = 0;
  let autoLogging = true;

  function sanitizeCell(cell) {
    return cell || '-';
  }

  function createBoardKey(board) {
    return board.map((row) => row.map(sanitizeCell).join('')).join('');
  }

  function createStateKey(board, isMaximizing, playerSymbol, opponentSymbol) {
    return [
      createBoardKey(board),
      isMaximizing ? 'max' : 'min',
      playerSymbol,
      opponentSymbol
    ].join('|');
  }

  function cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  function countSymbol(board, symbol) {
    let count = 0;
    for (let r = 0; r < board.length; r += 1) {
      for (let c = 0; c < board[r].length; c += 1) {
        if (board[r][c] === symbol) {
          count += 1;
        }
      }
    }
    return count;
  }

  function isFirstMoveForSymbol(board, symbol) {
    return countSymbol(board, symbol) === 0;
  }

  function findCenterMove(board) {
    const size = board.length;
    if (!size || size % 2 === 0) {
      return null;
    }

    const centerIndex = Math.floor(size / 2);
    if (!board[centerIndex][centerIndex]) {
      return { row: centerIndex, col: centerIndex };
    }

    return null;
  }

  function findCornerMove(board) {
    const size = board.length;
    if (!size) {
      return null;
    }

    const lastIndex = size - 1;
    const corners = [
      { row: 0, col: 0 },
      { row: 0, col: lastIndex },
      { row: lastIndex, col: 0 },
      { row: lastIndex, col: lastIndex }
    ];

    for (let i = 0; i < corners.length; i += 1) {
      const corner = corners[i];
      if (!board[corner.row][corner.col]) {
        return corner;
      }
    }

    return null;
  }

  function isBoardFull(board) {
    for (let r = 0; r < board.length; r += 1) {
      for (let c = 0; c < board[r].length; c += 1) {
        if (!board[r][c]) {
          return false;
        }
      }
    }
    return true;
  }

  function checkWinner(board) {
    const size = board.length;

    for (let r = 0; r < size; r += 1) {
      const value = board[r][0];
      if (!value) {
        continue;
      }

      let win = true;
      for (let c = 1; c < size; c += 1) {
        if (board[r][c] !== value) {
          win = false;
          break;
        }
      }

      if (win) {
        return value;
      }
    }

    for (let c = 0; c < size; c += 1) {
      const value = board[0][c];
      if (!value) {
        continue;
      }

      let win = true;
      for (let r = 1; r < size; r += 1) {
        if (board[r][c] !== value) {
          win = false;
          break;
        }
      }

      if (win) {
        return value;
      }
    }

    const diagOneValue = board[0][0];
    if (diagOneValue) {
      let win = true;
      for (let i = 1; i < size; i += 1) {
        if (board[i][i] !== diagOneValue) {
          win = false;
          break;
        }
      }
      if (win) {
        return diagOneValue;
      }
    }

    const diagTwoValue = board[0][size - 1];
    if (diagTwoValue) {
      let win = true;
      for (let i = 1; i < size; i += 1) {
        if (board[i][size - 1 - i] !== diagTwoValue) {
          win = false;
          break;
        }
      }
      if (win) {
        return diagTwoValue;
      }
    }

    return null;
  }

  function minimax(board, depth, isMaximizing, playerSymbol, opponentSymbol) {
    const winner = checkWinner(board);

    if (winner === playerSymbol) {
      return 10 - depth;
    }
    if (winner === opponentSymbol) {
      return depth - 10;
    }
    if (isBoardFull(board)) {
      return 0;
    }

    const key = createStateKey(board, isMaximizing, playerSymbol, opponentSymbol);
    if (stateCache.has(key)) {
      cacheHits += 1;
      return stateCache.get(key);
    }

    cacheMisses += 1;

    let bestScore = isMaximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;

    for (let r = 0; r < board.length; r += 1) {
      for (let c = 0; c < board[r].length; c += 1) {
        if (board[r][c]) {
          continue;
        }

        board[r][c] = isMaximizing ? playerSymbol : opponentSymbol;
        const score = minimax(board, depth + 1, !isMaximizing, playerSymbol, opponentSymbol);
        board[r][c] = '';

        if (isMaximizing) {
          if (score > bestScore) {
            bestScore = score;
          }
        } else if (score < bestScore) {
          bestScore = score;
        }
      }
    }

    stateCache.set(key, bestScore);
    return bestScore;
  }

  function calculateHitRate(hits, misses) {
    const total = hits + misses;
    if (!total) {
      return 0;
    }
    return hits / total;
  }

  function formatStats(label) {
    const stats = getCacheStats();
    const hitRate = Math.round(stats.hitRate * 1000) / 10;
    return `${LOG_PREFIX} ${label} cache hits=${stats.hits}, misses=${stats.misses}, size=${stats.size}, hitRate=${hitRate}%`;
  }

  function logCacheStats(label = 'stats') {
    const message = formatStats(label);
    if (autoLogging) {
      console.debug(message);
    } else {
      console.info(message);
    }
  }

  function chooseMove(board, playerSymbol = PLAYER_X, opponentSymbol = PLAYER_O) {
    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMove = null;

    if (isFirstMoveForSymbol(board, playerSymbol)) {
      const centerMove = findCenterMove(board);
      if (centerMove) {
        const move = { ...centerMove, score: 0 };
        logCacheStats('after chooseMove (heuristic center)');
        return move;
      }

      const cornerMove = findCornerMove(board);
      if (cornerMove) {
        const move = { ...cornerMove, score: 0 };
        logCacheStats('after chooseMove (heuristic corner)');
        return move;
      }
    }

    for (let r = 0; r < board.length; r += 1) {
      for (let c = 0; c < board[r].length; c += 1) {
        if (board[r][c]) {
          continue;
        }

        board[r][c] = playerSymbol;
        const score = minimax(board, 0, false, playerSymbol, opponentSymbol);
        board[r][c] = '';

        if (score > bestScore) {
          bestScore = score;
          bestMove = { row: r, col: c, score };
        }
      }
    }

    logCacheStats('after chooseMove');

    return bestMove;
  }

  function getCacheStats() {
    return {
      size: stateCache.size,
      hits: cacheHits,
      misses: cacheMisses,
      hitRate: calculateHitRate(cacheHits, cacheMisses)
    };
  }

  function clearCache(reason) {
    if (stateCache.size) {
      logCacheStats(`before clear (${reason || 'no reason provided'})`);
    }
    stateCache.clear();
    cacheHits = 0;
    cacheMisses = 0;
    if (reason) {
      console.info(`${LOG_PREFIX} cache cleared due to: ${reason}`);
    } else {
      console.info(`${LOG_PREFIX} cache cleared`);
    }
  }

  function setAutoLogging(enabled) {
    autoLogging = Boolean(enabled);
  }

  const api = {
    chooseMove,
    clearCache,
    getCacheStats,
    logCacheStats,
    setAutoLogging,
    _createStateKey: createStateKey,
    _cloneBoard: cloneBoard
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.MinimaxAI = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
