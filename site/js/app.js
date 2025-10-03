import { SettingsController } from './ui/settings.js';

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const boardElement = document.querySelector('[data-board]');
const cells = Array.from(boardElement.querySelectorAll('[data-cell]'));
const statusElement = document.querySelector('[data-status]');
const restartButton = document.querySelector('[data-restart]');
const pendingBanner = document.querySelector('[data-settings-pending]');

const playerPanels = {
  player1: document.querySelector('[data-player="player1"]'),
  player2: document.querySelector('[data-player="player2"]')
};

const playerSymbolElements = {
  player1: document.querySelector('[data-player-symbol="player1"]'),
  player2: document.querySelector('[data-player-symbol="player2"]')
};

const settings = new SettingsController({
  form: document.querySelector('#settings-form'),
  player1Select: document.querySelector('#settings-player1-symbol'),
  player2Select: document.querySelector('#settings-player2-symbol'),
  startInputs: document.querySelectorAll('input[name="settings-start"]'),
  errorContainer: document.querySelector('#settings-error')
});

settings.init();

let boardState = new Array(9).fill(null);
let currentPlayer = 'player1';
let gameOver = false;

const players = {
  player1: { id: 'player1', label: 'Player 1', symbol: 'X' },
  player2: { id: 'player2', label: 'Player 2', symbol: 'O' }
};

settings.onChange(({ valid, hasPendingChanges }) => {
  restartButton.disabled = !valid;
  pendingBanner.hidden = !hasPendingChanges;
});

restartButton.addEventListener('click', () => {
  if (!settings.isValid()) {
    settings.focusInvalid();
    return;
  }

  const snapshot = settings.commitPending();
  startNewGame(snapshot);
});

cells.forEach((cell, index) => {
  cell.dataset.index = index;
  cell.addEventListener('click', () => handleCellClick(index, cell));
});

startNewGame(settings.getActiveSettings());

function handleCellClick(index, cell) {
  if (gameOver || boardState[index]) {
    return;
  }

  boardState[index] = currentPlayer;
  cell.textContent = players[currentPlayer].symbol;
  cell.dataset.owner = currentPlayer;
  cell.disabled = true;

  const winLine = findWinningLine(currentPlayer);
  if (winLine) {
    gameOver = true;
    winLine.forEach((position) => {
      cells[position].classList.add('cell--win');
    });
    updateStatus(`${players[currentPlayer].label} wins!`);
    updateTurnIndicator(null);
    return;
  }

  if (boardState.every(Boolean)) {
    gameOver = true;
    updateStatus('Draw game.');
    updateTurnIndicator(null);
    return;
  }

  currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
  updateTurnIndicator(currentPlayer);
  updateStatus(`${players[currentPlayer].label}'s turn (${players[currentPlayer].symbol})`);
}

function startNewGame(snapshot = settings.getActiveSettings()) {
  boardState = new Array(9).fill(null);
  gameOver = false;
  currentPlayer = snapshot.starting;

  players.player1.symbol = snapshot.player1.symbol;
  players.player2.symbol = snapshot.player2.symbol;

  playerSymbolElements.player1.textContent = players.player1.symbol;
  playerSymbolElements.player2.textContent = players.player2.symbol;

  cells.forEach((cell) => {
    cell.textContent = '';
    cell.disabled = false;
    cell.classList.remove('cell--win');
    delete cell.dataset.owner;
  });

  updateTurnIndicator(currentPlayer);
  updateStatus(`${players[currentPlayer].label}'s turn (${players[currentPlayer].symbol})`);
}

function findWinningLine(player) {
  return WIN_LINES.find((line) => line.every((index) => boardState[index] === player)) || null;
}

function updateTurnIndicator(activePlayer) {
  Object.entries(playerPanels).forEach(([playerId, panel]) => {
    panel.classList.toggle('player--active', activePlayer && playerId === activePlayer);
  });
}

function updateStatus(message) {
  statusElement.textContent = message;
}
