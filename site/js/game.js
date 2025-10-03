'use strict';

import { createStatusController } from './ui/status.js';
import { initSettings } from './ui/settings.js';

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

const nextPlayer = (player) => (player === 'X' ? 'O' : 'X');

function queryNameElements(doc) {
  return {
    X: doc.querySelector('[data-role="name"][data-player="X"]'),
    O: doc.querySelector('[data-role="name"][data-player="O"]')
  };
}

function queryScoreElements(doc) {
  return {
    X: doc.querySelector('[data-role="score"][data-player="X"]'),
    O: doc.querySelector('[data-role="score"][data-player="O"]')
  };
}

function clearCell(cell) {
  cell.textContent = '';
  cell.removeAttribute('data-mark');
  cell.classList.remove('cell--x', 'cell--o', 'cell--winner');
  cell.removeAttribute('aria-disabled');
}

function renderCell(cell, player) {
  cell.textContent = player;
  cell.dataset.mark = player;
  cell.classList.remove('cell--x', 'cell--o');
  cell.classList.add(player === 'X' ? 'cell--x' : 'cell--o');
  cell.setAttribute('aria-disabled', 'true');
}

function disableAllCells(cells) {
  cells.forEach((cell) => {
    cell.setAttribute('aria-disabled', 'true');
  });
}

function findWinningLine(board, player) {
  return WINNING_LINES.find((line) => line.every((index) => board[index] === player));
}

function highlightWinner(cells, line) {
  line.forEach((index) => {
    cells[index].classList.add('cell--winner');
  });
}

function isBoardFull(board) {
  return board.every((value) => value !== null);
}

export function createGame(doc = document) {
  if (!doc) {
    throw new Error('A document reference is required to initialise the game.');
  }

  const cells = Array.from(doc.querySelectorAll('[data-cell]'));
  if (cells.length !== 9) {
    throw new Error('Expected exactly nine board cells to initialise the game.');
  }

  const newRoundButton = doc.getElementById('newRoundButton');
  const resetScoresButton = doc.getElementById('resetScoresButton');
  const resetGameButton = doc.getElementById('resetGameButton');
  const statusElement = doc.getElementById('statusMessage');

  const status = createStatusController({
    document: doc,
    statusElement,
    nameElements: queryNameElements(doc),
    scoreElements: queryScoreElements(doc)
  });

  let board = Array(9).fill(null);
  let currentPlayer = 'X';
  let gameOver = false;

  const startNewRound = (startingPlayer = 'X') => {
    board = Array(9).fill(null);
    gameOver = false;
    currentPlayer = startingPlayer;
    cells.forEach((cell) => clearCell(cell));
    status.setTurn(currentPlayer);
  };

  const resetGame = () => {
    status.resetScores();
    startNewRound('X');
  };

  const handleCellClick = (event) => {
    if (gameOver) {
      return;
    }

    const cell = event.currentTarget;
    const index = Number(cell.dataset.index);

    if (board[index]) {
      return;
    }

    board[index] = currentPlayer;
    renderCell(cell, currentPlayer);

    const winningLine = findWinningLine(board, currentPlayer);
    if (winningLine) {
      highlightWinner(cells, winningLine);
      gameOver = true;
      status.announceWin(currentPlayer);
      status.incrementScore(currentPlayer);
      disableAllCells(cells);
      return;
    }

    if (isBoardFull(board)) {
      gameOver = true;
      status.announceDraw();
      disableAllCells(cells);
      return;
    }

    currentPlayer = nextPlayer(currentPlayer);
    status.setTurn(currentPlayer);
  };

  cells.forEach((cell) => {
    cell.addEventListener('click', handleCellClick);
  });

  const handleNewRound = () => {
    startNewRound('X');
  };

  const handleResetScores = () => {
    status.resetScores();
  };

  newRoundButton?.addEventListener('click', handleNewRound);
  resetScoresButton?.addEventListener('click', handleResetScores);
  resetGameButton?.addEventListener('click', resetGame);

  const settings = initSettings({
    document: doc,
    defaultNames: status.getNames(),
    onPlayersUpdated: (names) => {
      status.applyNames(names);
    }
  });

  startNewRound('X');

  return {
    destroy() {
      cells.forEach((cell) => {
        cell.removeEventListener('click', handleCellClick);
      });
      newRoundButton?.removeEventListener('click', handleNewRound);
      resetScoresButton?.removeEventListener('click', handleResetScores);
      resetGameButton?.removeEventListener('click', resetGame);
    },
    getBoard: () => [...board],
    getCurrentPlayer: () => currentPlayer,
    getStatus: () => status,
    resetGame,
    startNewRound,
    getSettings: () => settings
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    createGame(document);
  });
}
