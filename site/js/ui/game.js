'use strict';

(function () {
  const BOARD_SIZE = 3;
  const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;
  const DEFAULT_NAMES = {
    X: "Player X",
    O: "Player O",
  };
  const ROW_NAMES = ["top", "middle", "bottom"];
  const COLUMN_NAMES = ["left", "center", "right"];

  const getNames = () => {
    if (window.uiStatus && typeof window.uiStatus.getNames === "function") {
      return window.uiStatus.getNames();
    }
    return { ...DEFAULT_NAMES };
  };

  document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const resetButton = document.getElementById("resetButton");

    if (!board || !resetButton) {
      return;
    }

    const statusApi = window.uiStatus;
    if (!statusApi) {
      console.warn("uiStatus API is unavailable; board will not announce turns.");
    }

    const cells = Array.from(
      board.querySelectorAll('[data-cell-index]')
    );

    if (cells.length !== TOTAL_CELLS) {
      throw new Error(`Expected ${TOTAL_CELLS} cells but found ${cells.length}.`);
    }

    const state = {
      board: Array(TOTAL_CELLS).fill(null),
      currentPlayer: "X",
      winner: null,
      isDraw: false,
      hasAnnouncedWin: false,
    };

    let focusedIndex = 0;

    const indexToRow = (index) => Math.floor(index / BOARD_SIZE);
    const indexToColumn = (index) => index % BOARD_SIZE;

    const formatCellLabel = (index, mark) => {
      const rowName = ROW_NAMES[indexToRow(index)] ?? `row ${indexToRow(index) + 1}`;
      const columnName = COLUMN_NAMES[indexToColumn(index)] ?? `column ${indexToColumn(index) + 1}`;
      const names = getNames();

      if (!mark) {
        const activeName = names[state.currentPlayer] ?? state.currentPlayer;
        return `${rowName} ${columnName} cell. Empty. ${activeName} to move.`;
      }

      const ownerName = names[mark] ?? mark;
      return `${rowName} ${columnName} cell. Occupied by ${ownerName} with ${mark}.`;
    };

    const updateCellAccessibility = (cell, index, mark) => {
      cell.setAttribute("aria-label", formatCellLabel(index, mark));
      if (mark) {
        cell.setAttribute("aria-pressed", "true");
        cell.setAttribute("data-player", mark);
      } else {
        cell.setAttribute("aria-pressed", "false");
        cell.removeAttribute("data-player");
      }
      cell.disabled = Boolean(mark) || Boolean(state.winner) || state.isDraw;
    };

    const renderBoard = () => {
      state.board.forEach((mark, index) => {
        const cell = cells[index];
        if (!cell) {
          return;
        }
        cell.textContent = mark ? mark : "";
        updateCellAccessibility(cell, index, mark);
      });
    };

    const updateStatus = () => {
      if (!statusApi) {
        return;
      }
      if (state.winner) {
        if (!state.hasAnnouncedWin) {
          statusApi.incrementScore(state.winner);
          state.hasAnnouncedWin = true;
        }
        statusApi.announceWin(state.winner);
        return;
      }
      if (state.isDraw) {
        statusApi.announceDraw();
        return;
      }
      state.hasAnnouncedWin = false;
      statusApi.setTurn(state.currentPlayer);
    };

    const focusCell = (index) => {
      const nextIndex = Math.max(0, Math.min(TOTAL_CELLS - 1, index));
      focusedIndex = nextIndex;
      cells.forEach((cell, cellIndex) => {
        cell.setAttribute("tabindex", cellIndex === focusedIndex ? "0" : "-1");
      });
      const nextCell = cells[focusedIndex];
      if (nextCell) {
        nextCell.focus();
      }
    };

    const evaluateWinner = () => {
      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];

      for (const [a, b, c] of lines) {
        const mark = state.board[a];
        if (mark && mark === state.board[b] && mark === state.board[c]) {
          state.winner = mark;
          return;
        }
      }

      state.winner = null;
      state.isDraw = state.board.every(Boolean);
    };

    const isGameOver = () => Boolean(state.winner) || state.isDraw;

    const handleMove = (index) => {
      if (isGameOver() || state.board[index]) {
        return;
      }

      state.board[index] = state.currentPlayer;
      evaluateWinner();

      if (!isGameOver()) {
        state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";
      }

      renderBoard();
      updateStatus();

      if (!isGameOver()) {
        updateEmptyCellLabels();
      }
    };

    const updateEmptyCellLabels = () => {
      state.board.forEach((mark, index) => {
        if (!mark) {
          updateCellAccessibility(cells[index], index, mark);
        }
      });
    };

    const resetGame = () => {
      state.board.fill(null);
      state.currentPlayer = "X";
      state.winner = null;
      state.isDraw = false;
      state.hasAnnouncedWin = false;
      renderBoard();
      updateStatus();
      focusCell(0);
    };

    board.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) {
        return;
      }
      const index = Number.parseInt(target.dataset.cellIndex ?? "", 10);
      if (Number.isNaN(index)) {
        return;
      }
      handleMove(index);
    });

    board.addEventListener("keydown", (event) => {
      const key = event.key;
      let nextIndex = focusedIndex;
      if (key === "ArrowRight") {
        nextIndex = focusedIndex + 1;
      } else if (key === "ArrowLeft") {
        nextIndex = focusedIndex - 1;
      } else if (key === "ArrowDown") {
        nextIndex = focusedIndex + BOARD_SIZE;
      } else if (key === "ArrowUp") {
        nextIndex = focusedIndex - BOARD_SIZE;
      } else if (key === "Home") {
        nextIndex = Math.floor(focusedIndex / BOARD_SIZE) * BOARD_SIZE;
      } else if (key === "End") {
        nextIndex = Math.floor(focusedIndex / BOARD_SIZE) * BOARD_SIZE + (BOARD_SIZE - 1);
      } else if (key === "PageUp") {
        nextIndex = focusedIndex % BOARD_SIZE;
      } else if (key === "PageDown") {
        nextIndex = focusedIndex % BOARD_SIZE + BOARD_SIZE * (BOARD_SIZE - 1);
      } else if (key === "Enter" || key === " ") {
        event.preventDefault();
        handleMove(focusedIndex);
        return;
      } else {
        return;
      }

      event.preventDefault();
      nextIndex = ((nextIndex % TOTAL_CELLS) + TOTAL_CELLS) % TOTAL_CELLS;
      focusCell(nextIndex);
    });

    resetButton.addEventListener("click", () => {
      resetGame();
    });

    document.addEventListener("settings:players-updated", () => {
      renderBoard();
      updateEmptyCellLabels();
      updateStatus();
    });

    renderBoard();
    updateStatus();
    focusCell(0);
  });
})();
