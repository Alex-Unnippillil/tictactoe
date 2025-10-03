import { initBoardKeyboardNavigation } from './keyboard.js';

const BOARD_SIZE = 3;
const boardState = createEmptyBoard();
let currentPlayer = 'X';
let gameOver = false;

const boardElement = document.querySelector('[data-role="board"]');
const statusElement = document.querySelector('[data-role="status"]');

if (!boardElement || !statusElement) {
  throw new Error('UI controller requires board and status elements to be present.');
}

const cells = Array.from(boardElement.querySelectorAll('[data-cell]'));
const keyboard = initBoardKeyboardNavigation(boardElement, handleCellActivation);

initialiseCells();
attachEventListeners();
announceTurn();

function initialiseCells() {
  cells.forEach((cell) => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    cell.querySelector('.cell__mark').textContent = '';
    cell.setAttribute('aria-label', describeCell(row, col, ''));
  });
}

function attachEventListeners() {
  boardElement.addEventListener('click', (event) => {
    const cell = event.target.closest('[data-cell]');
    if (!cell || !boardElement.contains(cell)) {
      return;
    }

    handleCellActivation(cell);
  });
}

function handleCellActivation(cell) {
  keyboard.setActiveCell(cell);

  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);

  if (Number.isNaN(row) || Number.isNaN(col)) {
    return;
  }

  if (gameOver) {
    updateStatus('The game is over. Refresh the page to start a new round.');
    return;
  }

  attemptMove(row, col, cell);
}

function attemptMove(row, col, cell) {
  const occupyingPlayer = boardState[row][col];
  if (occupyingPlayer) {
    updateStatus(`Square already taken by ${occupyingPlayer}. Choose another square.`);
    return false;
  }

  placeMark(row, col, cell);

  if (checkWin(currentPlayer)) {
    updateStatus(`${currentPlayer} wins!`);
    gameOver = true;
    return true;
  }

  if (isDraw()) {
    updateStatus("It's a draw!");
    gameOver = true;
    return true;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  announceTurn();
  return true;
}

function placeMark(row, col, cell) {
  boardState[row][col] = currentPlayer;
  cell.querySelector('.cell__mark').textContent = currentPlayer;
  cell.setAttribute('aria-label', describeCell(row, col, currentPlayer));
}

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(''));
}

function checkWin(player) {
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    if (boardState[row][0] === player && boardState[row][1] === player && boardState[row][2] === player) {
      return true;
    }
  }

  for (let col = 0; col < BOARD_SIZE; col += 1) {
    if (boardState[0][col] === player && boardState[1][col] === player && boardState[2][col] === player) {
      return true;
    }
  }

  if (boardState[0][0] === player && boardState[1][1] === player && boardState[2][2] === player) {
    return true;
  }

  if (boardState[0][2] === player && boardState[1][1] === player && boardState[2][0] === player) {
    return true;
  }

  return false;
}

function isDraw() {
  return boardState.every((row) => row.every((cell) => cell !== ''));
}

function describeCell(row, col, mark) {
  const base = `Row ${row + 1} column ${col + 1}`;
  return mark ? `${base}, contains ${mark}` : `${base}, empty`;
}

function updateStatus(message) {
  statusElement.textContent = message;
}

function announceTurn() {
  updateStatus(`${currentPlayer}'s turn.`);
}
