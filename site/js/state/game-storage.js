'use strict';

(function (global) {
  const SCORE_STORAGE_KEY = 'tictactoe:scores';
  const GAME_STORAGE_KEY = 'tictactoe:game-state';

  const domain = global.tictactoeGameDomain || {};
  const PLAYER_X = domain.PLAYER_X || 'X';
  const PLAYER_O = domain.PLAYER_O || 'O';
  const PLAYER_SYMBOLS = domain.PLAYER_SYMBOLS || [PLAYER_X, PLAYER_O];
  const SCORE_KEYS = [...PLAYER_SYMBOLS, 'draw'];
  const DEFAULT_SCORES = { [PLAYER_X]: 0, [PLAYER_O]: 0, draw: 0 };

  const safeLocalStorage = {
    read(key) {
      try {
        return global.localStorage ? global.localStorage.getItem(key) : null;
      } catch (error) {
        console.warn('Unable to read from storage', error);
        return null;
      }
    },
    write(key, value) {
      try {
        global.localStorage && global.localStorage.setItem(key, value);
      } catch (error) {
        console.warn('Unable to persist data', error);
      }
    },
    remove(key) {
      try {
        global.localStorage && global.localStorage.removeItem(key);
      } catch (error) {
        console.warn('Unable to remove data from storage', error);
      }
    },
  };

  function sanitiseStoredGameState(parsed) {
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const board = Array.isArray(parsed.board)
      ? parsed.board.map((value) => (PLAYER_SYMBOLS.includes(value) ? value : null)).slice(0, 9)
      : null;

    if (!board || board.length !== 9) {
      return null;
    }

    const currentPlayer = PLAYER_SYMBOLS.includes(parsed.currentPlayer) ? parsed.currentPlayer : PLAYER_X;
    const isRoundOver = Boolean(parsed.isRoundOver);
    const winningLine = Array.isArray(parsed.winningLine)
      ? parsed.winningLine.filter((index) => Number.isInteger(index)).slice(0, 3)
      : null;

    return {
      board,
      currentPlayer,
      isRoundOver,
      winningLine: winningLine && winningLine.length === 3 ? winningLine : null,
    };
  }

  function readStoredScores() {
    const raw = safeLocalStorage.read(SCORE_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SCORES };
    }

    try {
      const parsed = JSON.parse(raw);
      const next = { ...DEFAULT_SCORES };
      SCORE_KEYS.forEach((key) => {
        const value = parsed?.[key];
        next[key] = Number.isFinite(Number(value)) ? Number(value) : 0;
      });
      return next;
    } catch (error) {
      console.warn('Unable to parse stored scores', error);
      return { ...DEFAULT_SCORES };
    }
  }

  function readStoredGameState() {
    const raw = safeLocalStorage.read(GAME_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return sanitiseStoredGameState(JSON.parse(raw));
    } catch (error) {
      console.warn('Unable to parse stored game state', error);
      return null;
    }
  }

  const api = {
    SCORE_STORAGE_KEY,
    GAME_STORAGE_KEY,
    DEFAULT_SCORES,
    readStoredScores,
    readStoredGameState,
    writeStoredScores(scores) {
      safeLocalStorage.write(SCORE_STORAGE_KEY, JSON.stringify(scores));
    },
    writeStoredGameState(payload) {
      safeLocalStorage.write(GAME_STORAGE_KEY, JSON.stringify(payload));
    },
    clearStoredGameState() {
      safeLocalStorage.remove(GAME_STORAGE_KEY);
    },
    sanitiseStoredGameState,
  };

  global.tictactoeGameStorage = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
