import { getWinner, isDraw, availableMoves } from './core/rules.js';

const BOARD_SIZE = 3;
const boardElement = document.querySelector('.board');
const messageElement = document.querySelector('.message');

if (!boardElement || !messageElement) {
  throw new Error('Tic Tac Toe board markup is missing required elements.');
}

let currentPlayer = 'X';
let gameOver = false;
const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(''));

function clearHighlights() {
  boardElement.querySelectorAll('td').forEach((cell) => {
    cell.classList.remove('winning');
  });
}

function highlightWinningLine(line) {
  if (!Array.isArray(line)) {
    return;
  }

  line.forEach((index) => {
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    const cell = boardElement.rows[row]?.cells[col];
    if (cell) {
      cell.classList.add('winning');
    }
  });
}

function makeMove(row, col) {
  if (gameOver) {
    return;
  }

  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return;
  }

  const index = row * BOARD_SIZE + col;
  if (!availableMoves(board).some((move) => move.index === index)) {
    return;
  }

  const cellElement = boardElement.rows[row]?.cells[col];
  if (!cellElement) {
    return;
  }

  board[row][col] = currentPlayer;
  cellElement.textContent = currentPlayer;

  const winner = getWinner(board);
  if (winner) {
    clearHighlights();
    highlightWinningLine(winner.line);
    messageElement.textContent = `${winner.player} Wins!`;
    gameOver = true;
    return;
  }

  if (isDraw(board)) {
    messageElement.textContent = "It's a draw!";
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

window.makeMove = makeMove;
