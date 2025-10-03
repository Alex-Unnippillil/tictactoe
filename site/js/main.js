import { initModals } from './ui/modal.js';

const modalMap = initModals();
const settingsModal = modalMap.get('settings-modal');

const boardElement = document.querySelector('.board');
const messageElement = document.querySelector('.message');
const settingsForm = document.getElementById('settings-form');
const startingPlayerSelect = document.getElementById('starting-player');

let boardState = [];
let currentPlayer = startingPlayerSelect ? startingPlayerSelect.value : 'X';
let gameOver = false;

function createEmptyBoard() {
  return Array.from({ length: 3 }, () => ['', '', '']);
}

function resetBoardElements() {
  const cells = boardElement.querySelectorAll('[data-cell]');
  cells.forEach((cell) => {
    cell.textContent = '';
    cell.classList.remove('cell--winning');
    cell.disabled = false;
  });
}

function resetGame({ startingPlayer } = {}) {
  boardState = createEmptyBoard();
  const nextStartingPlayer = startingPlayer
    || (startingPlayerSelect ? startingPlayerSelect.value : currentPlayer);
  currentPlayer = nextStartingPlayer;
  if (startingPlayerSelect) {
    startingPlayerSelect.value = currentPlayer;
  }
  gameOver = false;
  messageElement.textContent = `${currentPlayer}'s turn`;
  resetBoardElements();
}

function getCellCoordinates(cell) {
  return cell.getAttribute('data-cell').split('-').map(Number);
}

function checkWin(player) {
  for (let i = 0; i < 3; i += 1) {
    if (boardState[i][0] === player && boardState[i][1] === player && boardState[i][2] === player) {
      return [
        [i, 0],
        [i, 1],
        [i, 2]
      ];
    }

    if (boardState[0][i] === player && boardState[1][i] === player && boardState[2][i] === player) {
      return [
        [0, i],
        [1, i],
        [2, i]
      ];
    }
  }

  if (boardState[0][0] === player && boardState[1][1] === player && boardState[2][2] === player) {
    return [
      [0, 0],
      [1, 1],
      [2, 2]
    ];
  }

  if (boardState[0][2] === player && boardState[1][1] === player && boardState[2][0] === player) {
    return [
      [0, 2],
      [1, 1],
      [2, 0]
    ];
  }

  return null;
}

function checkDraw() {
  return boardState.every((row) => row.every((cell) => cell !== ''));
}

function highlightWinningCells(cells) {
  cells.forEach(([row, col]) => {
    const cellButton = boardElement.querySelector(`[data-cell="${row}-${col}"]`);
    if (cellButton) {
      cellButton.classList.add('cell--winning');
    }
  });
}

function handleCellClick(event) {
  const cell = event.currentTarget;
  if (gameOver || cell.textContent !== '') {
    return;
  }

  const [row, col] = getCellCoordinates(cell);
  boardState[row][col] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.disabled = true;

  const winningCells = checkWin(currentPlayer);
  if (winningCells) {
    highlightWinningCells(winningCells);
    messageElement.textContent = `${currentPlayer} wins!`;
    gameOver = true;
    return;
  }

  if (checkDraw()) {
    messageElement.textContent = "It's a draw!";
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  messageElement.textContent = `${currentPlayer}'s turn`;
}

function setupBoard() {
  const cells = boardElement.querySelectorAll('[data-cell]');
  cells.forEach((cell) => {
    cell.addEventListener('click', handleCellClick);
  });
}

if (settingsForm) {
  settingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    resetGame({ startingPlayer: startingPlayerSelect.value });
    if (settingsModal) {
      settingsModal.close();
    }
  });
}

const resetButton = document.getElementById('reset-button');
if (resetButton) {
  resetButton.addEventListener('click', () => {
    resetGame({ startingPlayer: startingPlayerSelect.value });
  });
}

resetGame({ startingPlayer: currentPlayer });
setupBoard();
