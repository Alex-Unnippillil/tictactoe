import {
  DIFFICULTIES,
  chooseMove,
  checkWinner,
  isDraw,
  isAIMode,
} from "../game/ai.js";
import {
  initSettings,
  getCurrentMode,
  getModeVersion,
  forceModeSync,
} from "./settings.js";

const cells = Array.from(document.querySelectorAll("[data-cell]"));
const statusEl = document.querySelector("[data-status]");

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let pendingAITimeout = null;

const defaultMode = (
  document.querySelector('input[name="mode"]:checked')?.value ||
  DIFFICULTIES.HUMAN
);
forceModeSync(defaultMode);

initSettings({
  onModeChange: handleModeChange,
  onReset: () => resetGame({ announce: true }),
});

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    const index = Number.parseInt(cell.dataset.cell, 10);
    handleHumanMove(index);
  });
});

resetGame();

function handleHumanMove(index) {
  if (gameOver) {
    return;
  }

  if (board[index]) {
    return;
  }

  if (isAIMode(getCurrentMode()) && currentPlayer === "O") {
    return;
  }

  performMove(index, currentPlayer);
}

function performMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].disabled = true;

  const winner = checkWinner(board);
  if (winner) {
    concludeGame(`${winner} wins!`);
    return;
  }

  if (isDraw(board)) {
    concludeGame("It's a draw!");
    return;
  }

  currentPlayer = player === "X" ? "O" : "X";
  updateStatus();

  if (!gameOver && currentPlayer === "O" && isAIMode(getCurrentMode())) {
    scheduleAITurn();
  }
}

function scheduleAITurn() {
  clearPendingAIMove();
  updateStatus();

  const scheduledMode = getCurrentMode();
  const scheduledVersion = getModeVersion();

  pendingAITimeout = window.setTimeout(() => {
    pendingAITimeout = null;
    if (gameOver) {
      return;
    }

    if (currentPlayer !== "O") {
      return;
    }

    if (!isAIMode(getCurrentMode())) {
      return;
    }

    if (scheduledMode !== getCurrentMode() || scheduledVersion !== getModeVersion()) {
      return;
    }

    const move = chooseMove(board.slice(), "O", scheduledMode);
    if (move === null || move === undefined) {
      return;
    }

    performMove(move, "O");
  }, 400);
}

function handleModeChange() {
  clearPendingAIMove();

  if (!gameOver && currentPlayer === "O" && isAIMode(getCurrentMode())) {
    scheduleAITurn();
  } else {
    updateStatus();
  }
}

function updateStatus() {
  if (gameOver) {
    return;
  }

  if (currentPlayer === "X") {
    setStatus("Player X's turn");
    return;
  }

  if (isAIMode(getCurrentMode())) {
    setStatus("AI (O) is thinking…");
  } else {
    setStatus("Player O's turn");
  }
}

function concludeGame(message) {
  gameOver = true;
  clearPendingAIMove();
  setStatus(message);
  cells.forEach((cell) => {
    cell.disabled = true;
  });
}

function resetGame({ announce = false } = {}) {
  clearPendingAIMove();
  board = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
  });

  if (announce) {
    setStatus("New game! Player X starts.");
  } else {
    setStatus("Player X's turn");
  }
}

function clearPendingAIMove() {
  if (pendingAITimeout !== null) {
    window.clearTimeout(pendingAITimeout);
    pendingAITimeout = null;
  }
}

function setStatus(message) {
  statusEl.textContent = message;
}
