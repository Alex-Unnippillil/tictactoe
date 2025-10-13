'use strict';

(function (global) {
  const SCORE_STORAGE_KEY = 'tictactoe:scores';
  const GAME_STORAGE_KEY = 'tictactoe:game-state';

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
  const SCORE_KEYS = [...PLAYER_SYMBOLS, 'draw'];
  const WINNING_LINES = constants.WINNING_LINES || fallbackConstants.WINNING_LINES;

  const cloneBoard = (board) => board.slice();

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

  const DEFAULT_SCORES = { [PLAYER_X]: 0, [PLAYER_O]: 0, draw: 0 };

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
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }
      const board = Array.isArray(parsed.board)
        ? parsed.board.map((value) => (PLAYER_SYMBOLS.includes(value) ? value : null)).slice(0, 9)
        : null;
      if (!board || board.length !== 9) {
        return null;
      }

      const currentPlayer = PLAYER_SYMBOLS.includes(parsed.currentPlayer)
        ? parsed.currentPlayer
        : PLAYER_X;
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
    } catch (error) {
      console.warn('Unable to parse stored game state', error);
      return null;
    }
  }

  function getPlayerNames() {
    const core = global.coreState;
    if (core && typeof core.getPlayerNames === 'function') {
      try {
        const names = core.getPlayerNames();
        if (names && typeof names === 'object') {
          return names;
        }
      } catch (error) {
        console.warn('Unable to read player names from core state', error);
      }
    }
    return { [PLAYER_X]: `Player ${PLAYER_X}`, [PLAYER_O]: `Player ${PLAYER_O}` };
  }

  function formatPlayerName(player) {
    const names = getPlayerNames();
    return names?.[player] || `Player ${player}`;
  }

  function createGameController() {
    const statusApi = global.uiStatus;
    const statusElement = document.getElementById('statusMessage');
    const boardElement = document.getElementById('board');
    if (!boardElement) {
      return null;
    }

    const cells = Array.from(boardElement.querySelectorAll('[data-cell]'));
    if (cells.length !== 9) {
      return null;
    }

    const deriveBaseLabel = (label) =>
      typeof label === 'string' ? label.replace(/,\s*(empty|x|o|occupied.*)$/i, '') : '';

    const ensureGlyphContainer = (cell) => {
      let glyph = cell.querySelector('.cell__glyph');
      if (!glyph) {
        glyph = document.createElement('span');
        glyph.className = 'cell__glyph';
        glyph.setAttribute('aria-hidden', 'true');
        cell.appendChild(glyph);
      }
      return glyph;
    };

    cells.forEach((cell) => {
      ensureGlyphContainer(cell);
      const ariaLabel = cell.getAttribute('aria-label') || '';
      const normalized = deriveBaseLabel(ariaLabel);
      if (normalized) {
        cell.dataset.baseLabel = normalized;
      } else if (!cell.dataset.baseLabel) {
        cell.dataset.baseLabel = ariaLabel;
      }
    });

    const resetGameButton = document.getElementById('resetGameButton');
    const resetScoresButton = document.getElementById('resetScoresButton');
    const newRoundButton = document.getElementById('newRoundButton');

    const getGlyphContainer = (cell) => cell.querySelector('.cell__glyph');

    const updateCellAriaLabel = (cell, value) => {
      const baseLabel = cell.dataset.baseLabel || deriveBaseLabel(cell.getAttribute('aria-label'));
      if (baseLabel) {
        if (value) {
          const playerName = formatPlayerName(value);
          cell.setAttribute('aria-label', `${baseLabel}, ${playerName} (${value}) placed`);
        } else {
          cell.setAttribute('aria-label', `${baseLabel}, empty`);
        }
      } else if (value) {
        const playerName = formatPlayerName(value);
        cell.setAttribute('aria-label', `${playerName} (${value}) placed`);
      } else {
        cell.setAttribute('aria-label', 'Empty cell');
      }
    };

    let glyphIdCounter = 0;

    const createGlyphMarkup = (player) => {
      glyphIdCounter += 1;
      const prefix = player === PLAYER_X ? 'x' : 'o';
      const strokeId = `cell-glyph-${prefix}-stroke-${glyphIdCounter}`;
      const highlightId = `cell-glyph-${prefix}-highlight-${glyphIdCounter}`;
      if (player === PLAYER_X) {
        return `
          <svg class="cell__icon cell__icon--x" viewBox="0 0 48 48" role="presentation" focusable="false">
            <defs>
              <linearGradient id="${strokeId}" x1="14%" y1="10%" x2="86%" y2="90%">
                <stop offset="0%" style="stop-color: var(--cell-x-color-soft);" />
                <stop offset="55%" style="stop-color: var(--cell-x-color);" />
                <stop offset="100%" style="stop-color: var(--cell-x-color-strong);" />
              </linearGradient>
              <linearGradient id="${highlightId}" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" style="stop-color: rgba(255, 255, 255, 0.92);" />
                <stop offset="100%" style="stop-color: rgba(255, 255, 255, 0);" />
              </linearGradient>
            </defs>
            <g>
              <path d="M13 13 L35 35" stroke="url(#${strokeId})" stroke-width="6.2" stroke-linecap="round" />
              <path d="M35 13 L13 35" stroke="url(#${strokeId})" stroke-width="6.2" stroke-linecap="round" />
              <path d="M13 13 L35 35" stroke="url(#${highlightId})" stroke-width="2.4" stroke-linecap="round" opacity="0.85" />
              <path d="M35 13 L13 35" stroke="url(#${highlightId})" stroke-width="2.4" stroke-linecap="round" opacity="0.85" />
            </g>
          </svg>
        `.trim();
      }

      return `
        <svg class="cell__icon cell__icon--o" viewBox="0 0 48 48" role="presentation" focusable="false">
          <defs>
            <linearGradient id="${strokeId}" x1="24%" y1="0%" x2="76%" y2="100%">
              <stop offset="0%" style="stop-color: var(--cell-o-color-soft);" />
              <stop offset="55%" style="stop-color: var(--cell-o-color);" />
              <stop offset="100%" style="stop-color: var(--cell-o-color-strong);" />
            </linearGradient>
            <linearGradient id="${highlightId}" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" style="stop-color: rgba(255, 255, 255, 0.9);" />
              <stop offset="100%" style="stop-color: rgba(255, 255, 255, 0);" />
            </linearGradient>
          </defs>
          <g>
            <circle cx="24" cy="24" r="11" stroke="url(#${strokeId})" stroke-width="6" fill="none" />
            <circle cx="24" cy="24" r="11" stroke="url(#${highlightId})" stroke-width="2.6" fill="none" opacity="0.85" />
          </g>
        </svg>
      `.trim();
    };

    let scores = readStoredScores();
    let board = Array(9).fill(null);
    let currentPlayer = PLAYER_X;
    let isRoundOver = false;
    let winningLine = null;
    let nextStartingPlayer = PLAYER_X;

    const dispatchEvent = (name, detail) => {
      if (typeof document === 'undefined' || typeof CustomEvent !== 'function') {
        return;
      }
      document.dispatchEvent(new CustomEvent(`game:${name}`, { detail }));
    };

    const persistScores = () => {
      safeLocalStorage.write(SCORE_STORAGE_KEY, JSON.stringify(scores));
    };

    const persistGameState = () => {
      const payload = {
        board,
        currentPlayer,
        isRoundOver,
        winningLine,
      };
      safeLocalStorage.write(GAME_STORAGE_KEY, JSON.stringify(payload));
    };

    const clearPersistedGameState = () => {
      safeLocalStorage.remove(GAME_STORAGE_KEY);
    };

    const setCellDisabled = (cell, disabled) => {
      cell.disabled = disabled;
      cell.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    };

    const clearCell = (cell) => {
      cell.classList.remove('cell--x', 'cell--o', 'cell--winner');
      const glyph = getGlyphContainer(cell);
      if (glyph) {
        glyph.innerHTML = '';
      }
      cell.removeAttribute('data-value');
      setCellDisabled(cell, false);
      updateCellAriaLabel(cell, null);
    };

    const renderScores = () => {
      if (statusApi && typeof statusApi.setScores === 'function') {
        statusApi.setScores({ ...scores });
        return;
      }

      SCORE_KEYS.forEach((key) => {
        const element = document.querySelector(
          `[data-role="score"][data-player="${key}"]`
        );
        if (element) {
          element.textContent = String(scores[key] ?? 0);
        }
      });
    };

    const setStatusText = (text) => {
      if (statusElement) {
        statusElement.textContent = text;
      }
    };

    const announceTurn = (player) => {
      if (statusApi && typeof statusApi.setTurn === 'function') {
        statusApi.setTurn(player);
      } else {
        setStatusText(`${formatPlayerName(player)} (${player}) to move`);
      }
    };

    const announceWin = (player) => {
      if (statusApi && typeof statusApi.announceWin === 'function') {
        statusApi.announceWin(player);
      } else {
        setStatusText(`${formatPlayerName(player)} (${player}) wins this round!`);
      }
    };

    const announceDraw = () => {
      if (statusApi && typeof statusApi.announceDraw === 'function') {
        statusApi.announceDraw();
      } else {
        setStatusText("It's a draw!");
      }
    };

    const setCellValue = (cell, value) => {
      clearCell(cell);
      if (!value) {
        return;
      }
      const glyph = getGlyphContainer(cell);
      if (glyph) {
        glyph.innerHTML = createGlyphMarkup(value);
      }
      cell.setAttribute('data-value', value);
      cell.classList.add(value === PLAYER_X ? 'cell--x' : 'cell--o');
      setCellDisabled(cell, true);
      updateCellAriaLabel(cell, value);
    };

    const highlightWinningLine = (line) => {
      if (!Array.isArray(line)) {
        return;
      }
      line.forEach((index) => {
        const cell = cells[index];
        if (cell) {
          cell.classList.add('cell--winner');
        }
      });
    };

    const runWinEffects = (player) => {
      const effects = global.uiEffects;
      if (!effects) {
        return;
      }
      const tone = player === PLAYER_X ? 'x' : 'o';
      if (typeof effects.playConfetti === 'function') {
        effects.playConfetti({ tone });
      }
      if (typeof effects.playRadialGlow === 'function') {
        effects.playRadialGlow(boardElement, { tone });
      }
    };

    const runDrawEffects = () => {
      const effects = global.uiEffects;
      if (!effects || typeof effects.playParticleOverlay !== 'function') {
        return;
      }
      effects.playParticleOverlay(boardElement, { tone: 'draw' });
    };

    const refreshBoardUi = () => {
      cells.forEach((cell, index) => {
        const value = board[index];
        setCellValue(cell, value);
        if (!value && !isRoundOver) {
          setCellDisabled(cell, false);
        }
      });

      if (isRoundOver && winningLine) {
        highlightWinningLine(winningLine);
        cells.forEach((cell) => setCellDisabled(cell, true));
      }
    };

    const updateStatusForState = () => {
      if (isRoundOver) {
        if (winningLine && board[winningLine[0]]) {
          announceWin(board[winningLine[0]]);
        } else {
          announceDraw();
        }
      } else {
        announceTurn(currentPlayer);
      }
    };

    const applyStoredGameState = () => {
      const stored = readStoredGameState();
      if (!stored) {
        renderScores();
        return;
      }

      board = cloneBoard(stored.board);
      currentPlayer = PLAYER_SYMBOLS.includes(stored.currentPlayer)
        ? stored.currentPlayer
        : PLAYER_X;
      isRoundOver = Boolean(stored.isRoundOver);
      winningLine = stored.winningLine;

      const evaluation = evaluateBoard(board);
      if (evaluation.winner) {
        isRoundOver = true;
        winningLine = evaluation.line;
      } else if (evaluation.isDraw) {
        isRoundOver = true;
        winningLine = null;
      }

      refreshBoardUi();
      updateStatusForState();
      renderScores();

      nextStartingPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    };

    const clearBoard = () => {
      board = Array(9).fill(null);
      isRoundOver = false;
      winningLine = null;
      cells.forEach((cell) => clearCell(cell));
    };

    const startNewRound = ({ resetStarter = false } = {}) => {
      if (resetStarter) {
        nextStartingPlayer = PLAYER_X;
      }

      clearBoard();
      currentPlayer = nextStartingPlayer;
      nextStartingPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
      refreshBoardUi();
      announceTurn(currentPlayer);
      persistGameState();
      dispatchEvent('round-started', {
        board: cloneBoard(board),
        currentPlayer,
      });
    };

    const handleWin = (player, line) => {
      scores[player] = (scores[player] ?? 0) + 1;
      renderScores();
      persistScores();

      announceWin(player);
      highlightWinningLine(line);
      runWinEffects(player);
      cells.forEach((cell) => setCellDisabled(cell, true));
      dispatchEvent('round-ended', {
        result: 'win',
        winner: player,
        line: [...line],
        board: cloneBoard(board),
      });
    };

    const handleDraw = () => {
      scores.draw = (scores.draw ?? 0) + 1;
      renderScores();
      persistScores();
      announceDraw();
      runDrawEffects();
      cells.forEach((cell) => setCellDisabled(cell, true));
      dispatchEvent('round-ended', {
        result: 'draw',
        board: cloneBoard(board),
      });
    };

    const playMove = (index) => {
      if (isRoundOver || board[index]) {
        return;
      }

      board[index] = currentPlayer;
      setCellValue(cells[index], currentPlayer);

      const evaluation = evaluateBoard(board);

      if (evaluation.winner) {
        isRoundOver = true;
        winningLine = evaluation.line;
        handleWin(currentPlayer, evaluation.line);
      } else if (evaluation.isDraw) {
        isRoundOver = true;
        winningLine = null;
        handleDraw();
      } else {
        currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
        announceTurn(currentPlayer);
      }

      persistGameState();
      dispatchEvent('move-played', {
        board: cloneBoard(board),
        index,
        player: board[index],
        isRoundOver,
      });
    };

    const confirmReset = (message) => {
      if (!board.some((cell) => cell) || typeof global.confirm !== 'function') {
        return true;
      }
      return global.confirm(message);
    };

    const resetScores = () => {
      scores = { ...DEFAULT_SCORES };
      renderScores();
      persistScores();
    };

    const resetGame = () => {
      resetScores();
      nextStartingPlayer = PLAYER_X;
      clearPersistedGameState();
      startNewRound({ resetStarter: true });
    };

    const attachEventListeners = () => {
      cells.forEach((cell, index) => {
        cell.addEventListener('click', () => {
          playMove(index);
        });
      });

      if (newRoundButton) {
        newRoundButton.addEventListener('click', () => {
          if (!isRoundOver && !confirmReset('Start a new round and clear the current board?')) {
            return;
          }
          startNewRound();
        });
      }

      if (resetGameButton) {
        resetGameButton.addEventListener('click', () => {
          if (!confirmReset('Reset the game, clearing the board and scores?')) {
            return;
          }
          resetGame();
        });
      }

      if (resetScoresButton) {
        resetScoresButton.addEventListener('click', () => {
          if (!SCORE_KEYS.some((key) => scores[key])) {
            return;
          }
          if (typeof global.confirm === 'function') {
            const proceed = global.confirm('Reset the scoreboard?');
            if (!proceed) {
              return;
            }
          }
          resetScores();
          persistGameState();
        });
      }
    };

    const initialise = () => {
      renderScores();
      applyStoredGameState();

      if (!isRoundOver && !board.some((value) => value)) {
        // No stored state, ensure we have a fresh board.
        startNewRound({ resetStarter: true });
      } else {
        persistGameState();
      }
    };

    attachEventListeners();
    initialise();

    const api = {
      getState() {
        return {
          board: cloneBoard(board),
          currentPlayer,
          isRoundOver,
          winningLine: winningLine ? [...winningLine] : null,
          scores: { ...scores },
        };
      },
      playMove,
      startNewRound,
      resetGame,
      resetScores,
    };

    return api;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const controller = createGameController();
    if (controller) {
      global.tictactoeGame = controller;
      global.GameController = controller;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
