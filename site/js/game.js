'use strict';

(function (global) {
  const domain = global.tictactoeGameDomain;
  const storage = global.tictactoeGameStorage;
  const cellRendererApi = global.tictactoeCellRenderer;

  if (!domain || !storage || !cellRendererApi) {
    return;
  }

  const { PLAYER_X, PLAYER_O, PLAYER_SYMBOLS, cloneBoard, evaluateBoard, applyMove, determineRoundTransition, nextRoundStarter } = domain;
  const SCORE_KEYS = [...PLAYER_SYMBOLS, 'draw'];

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
    if (!boardElement) return null;

    const cells = Array.from(boardElement.querySelectorAll('[data-cell]'));
    if (cells.length !== 9) return null;

    const { setCellDisabled, clearCell, setCellValue } = cellRendererApi.createCellRenderer({
      cells,
      formatPlayerName,
      playerX: PLAYER_X,
    });

    const resetGameButton = document.getElementById('resetGameButton');
    const resetScoresButton = document.getElementById('resetScoresButton');
    const newRoundButton = document.getElementById('newRoundButton');

    let scores = storage.readStoredScores();
    let board = Array(9).fill(null);
    let currentPlayer = PLAYER_X;
    let isRoundOver = false;
    let winningLine = null;
    let nextStartingPlayer = PLAYER_X;

    const dispatchEvent = (name, detail) => {
      if (typeof document === 'undefined' || typeof CustomEvent !== 'function') return;
      document.dispatchEvent(new CustomEvent(`game:${name}`, { detail }));
    };

    const persistScores = () => storage.writeStoredScores(scores);
    const persistGameState = () => storage.writeStoredGameState({ board, currentPlayer, isRoundOver, winningLine });

    const renderScores = () => {
      if (statusApi && typeof statusApi.setScores === 'function') {
        statusApi.setScores({ ...scores });
        return;
      }

      SCORE_KEYS.forEach((key) => {
        const element = document.querySelector(`[data-role="score"][data-player="${key}"]`);
        if (element) element.textContent = String(scores[key] ?? 0);
      });
    };

    const setStatusText = (text) => {
      if (statusElement) statusElement.textContent = text;
    };

    const announceTurn = (player) => statusApi?.setTurn ? statusApi.setTurn(player) : setStatusText(`${formatPlayerName(player)} (${player}) to move`);
    const announceWin = (player) => statusApi?.announceWin ? statusApi.announceWin(player) : setStatusText(`${formatPlayerName(player)} (${player}) wins this round!`);
    const announceDraw = () => statusApi?.announceDraw ? statusApi.announceDraw() : setStatusText("It's a draw!");

    const highlightWinningLine = (line) => Array.isArray(line) && line.forEach((index) => cells[index]?.classList.add('cell--winner'));

    const refreshBoardUi = () => {
      cells.forEach((cell, index) => {
        const value = board[index];
        setCellValue(cell, value);
        if (!value && !isRoundOver) setCellDisabled(cell, false);
      });
      if (isRoundOver && winningLine) {
        highlightWinningLine(winningLine);
        cells.forEach((cell) => setCellDisabled(cell, true));
      }
    };

    const applyStoredGameState = () => {
      const stored = storage.readStoredGameState();
      if (!stored) {
        renderScores();
        return;
      }

      board = cloneBoard(stored.board);
      currentPlayer = PLAYER_SYMBOLS.includes(stored.currentPlayer) ? stored.currentPlayer : PLAYER_X;
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
      isRoundOver ? (winningLine ? announceWin(board[winningLine[0]]) : announceDraw()) : announceTurn(currentPlayer);
      renderScores();
      nextStartingPlayer = nextRoundStarter(currentPlayer);
    };

    const clearBoard = () => {
      board = Array(9).fill(null);
      isRoundOver = false;
      winningLine = null;
      cells.forEach((cell) => clearCell(cell));
    };

    const startNewRound = ({ resetStarter = false } = {}) => {
      if (resetStarter) nextStartingPlayer = PLAYER_X;
      clearBoard();
      currentPlayer = nextStartingPlayer;
      nextStartingPlayer = nextRoundStarter(currentPlayer);
      refreshBoardUi();
      announceTurn(currentPlayer);
      persistGameState();
      dispatchEvent('round-started', { board: cloneBoard(board), currentPlayer });
    };

    const finishRound = (result, line = null) => {
      isRoundOver = true;
      winningLine = line;
      if (result === 'win') {
        scores[currentPlayer] = (scores[currentPlayer] ?? 0) + 1;
        announceWin(currentPlayer);
        highlightWinningLine(line);
      } else {
        scores.draw = (scores.draw ?? 0) + 1;
        announceDraw();
      }
      renderScores();
      persistScores();
      cells.forEach((cell) => setCellDisabled(cell, true));
      dispatchEvent('round-ended', { result, winner: result === 'win' ? currentPlayer : null, line, board: cloneBoard(board) });
    };

    const playMove = (index) => {
      if (isRoundOver || board[index]) return;
      const move = applyMove(board, index, currentPlayer);
      if (!move.played) return;
      board = move.board;
      setCellValue(cells[index], currentPlayer);
      const evaluation = evaluateBoard(board);
      const transition = determineRoundTransition(currentPlayer, evaluation);
      if (transition.isRoundOver) {
        finishRound(evaluation.winner ? 'win' : 'draw', transition.winningLine);
      } else {
        currentPlayer = transition.nextPlayer;
        announceTurn(currentPlayer);
      }
      persistGameState();
      dispatchEvent('move-played', { board: cloneBoard(board), index, player: board[index], isRoundOver });
    };

    const resetScores = () => {
      scores = { ...storage.DEFAULT_SCORES };
      renderScores();
      persistScores();
    };

    const resetGame = () => {
      resetScores();
      nextStartingPlayer = PLAYER_X;
      storage.clearStoredGameState();
      startNewRound({ resetStarter: true });
    };

    cells.forEach((cell, index) => cell.addEventListener('click', () => playMove(index)));
    newRoundButton?.addEventListener('click', () => startNewRound());
    resetGameButton?.addEventListener('click', () => resetGame());
    resetScoresButton?.addEventListener('click', () => {
      if (SCORE_KEYS.some((key) => scores[key])) {
        resetScores();
        persistGameState();
      }
    });

    renderScores();
    applyStoredGameState();
    if (!isRoundOver && !board.some((value) => value)) startNewRound({ resetStarter: true });
    else persistGameState();

    return { getState: () => ({ board: cloneBoard(board), currentPlayer, isRoundOver, winningLine: winningLine ? [...winningLine] : null, scores: { ...scores } }), playMove, startNewRound, resetGame, resetScores };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const controller = createGameController();
    if (controller) {
      global.tictactoeGame = controller;
      global.GameController = controller;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
