import {
  createEmptyState,
  applyMove,
  currentPlayer,
  isCellEmpty,
} from './core/gameState.js';

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const boardElement = document.querySelector('.board');
const messageElement = document.querySelector('.message');
const cells = Array.from(boardElement.querySelectorAll('td'));

let state = createEmptyState();
let gameOver = false;

cells.forEach((cell, index) => {
  cell.addEventListener('click', () => handleMove(index));
});

function handleMove(index) {
  if (gameOver || !isCellEmpty(state, index)) {
    return;
  }

  const player = currentPlayer(state);
  state = applyMove(state, index);
  cells[index].textContent = player;

  if (hasPlayerWon(state.board, player)) {
    messageElement.textContent = `${player} Wins!`;
    gameOver = true;
  } else if (isDraw(state.board)) {
    messageElement.textContent = "It's a draw!";
    gameOver = true;
  }
}

function hasPlayerWon(board, player) {
  return winningCombinations.some((combo) =>
    combo.every((index) => board[index] === player),
  );
}

function isDraw(board) {
  return board.every((cell) => cell !== null);
}
