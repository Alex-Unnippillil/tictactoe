const boardElement = document.querySelector('[data-board]');
const statusElement = document.querySelector('[data-status]');
const resetButton = document.querySelector('[data-reset]');
const themeToggle = document.querySelector('[data-theme-toggle]');

const BOARD_SIZE = 3;
let boardState = [];
let currentPlayer = 'X';
let isGameOver = false;

function createSquare(row, column) {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('data-row', row);
  button.setAttribute('data-column', column);
  button.addEventListener('click', () => handleMove(row, column, button));
  return button;
}

function initializeBoard() {
  boardElement.innerHTML = '';
  boardState = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(''));

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      boardElement.appendChild(createSquare(row, column));
    }
  }

  currentPlayer = 'X';
  isGameOver = false;
  updateStatus(`${describePlayer(currentPlayer)}'s turn`);
}

function describePlayer(player) {
  return `Player ${player}`;
}

function handleMove(row, column, button) {
  if (isGameOver || boardState[row][column]) {
    return;
  }

  boardState[row][column] = currentPlayer;
  button.textContent = currentPlayer;

  if (checkWin(currentPlayer)) {
    updateStatus(`${describePlayer(currentPlayer)} wins!`);
    isGameOver = true;
    return;
  }

  if (isDraw()) {
    updateStatus("It's a draw!");
    isGameOver = true;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus(`${describePlayer(currentPlayer)}'s turn`);
}

function updateStatus(message) {
  statusElement.textContent = message;
}

function buildCoordinateLines() {
  const rows = Array.from({ length: BOARD_SIZE }, (_, rowIndex) =>
    Array.from({ length: BOARD_SIZE }, (_, columnIndex) => [rowIndex, columnIndex])
  );

  const columns = Array.from({ length: BOARD_SIZE }, (_, columnIndex) =>
    Array.from({ length: BOARD_SIZE }, (_, rowIndex) => [rowIndex, columnIndex])
  );

  const diagonals = [
    Array.from({ length: BOARD_SIZE }, (_, index) => [index, index]),
    Array.from({ length: BOARD_SIZE }, (_, index) => [index, BOARD_SIZE - 1 - index])
  ];

  return [...rows, ...columns, ...diagonals];
}

const coordinateLines = buildCoordinateLines();

function checkWin(player) {
  return coordinateLines.some((line) =>
    line.every(([row, column]) => boardState[row][column] === player)
  );
}

function isDraw() {
  return boardState.flat().every(Boolean);
}

resetButton.addEventListener('click', initializeBoard);

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
});

initializeBoard();
