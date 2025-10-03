(function () {
  const GRID_SIZE = 3;
  const WINNING_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const KEY_TO_DIRECTION = {
    ArrowUp: { row: -1, col: 0 },
    ArrowDown: { row: 1, col: 0 },
    ArrowLeft: { row: 0, col: -1 },
    ArrowRight: { row: 0, col: 1 },
  };

  const nextPlayer = (player) => (player === "X" ? "O" : "X");

  const positionFromIndex = (index) => ({
    row: Math.floor(index / GRID_SIZE),
    col: index % GRID_SIZE,
  });

  const wrapPosition = (row, col) => {
    let nextRow = row;
    let nextCol = col;

    if (nextCol < 0) {
      nextCol = GRID_SIZE - 1;
      nextRow = (nextRow - 1 + GRID_SIZE) % GRID_SIZE;
    } else if (nextCol >= GRID_SIZE) {
      nextCol = 0;
      nextRow = (nextRow + 1) % GRID_SIZE;
    }

    if (nextRow < 0) {
      nextRow = GRID_SIZE - 1;
    } else if (nextRow >= GRID_SIZE) {
      nextRow = 0;
    }

    return { row: nextRow, col: nextCol };
  };

  document.addEventListener("DOMContentLoaded", () => {
    const cells = Array.from(document.querySelectorAll("[data-cell]"));
    const newRoundButton = document.getElementById("newRoundButton");
    const resetScoresButton = document.getElementById("resetScoresButton");
    const resetGameButton = document.getElementById("resetGameButton");
    const invalidMoveRegion = document.getElementById("invalidMoveMessage");
    const status = window.uiStatus;

    if (!status) {
      throw new Error("Status UI has not been initialised");
    }

    if (!cells.length) {
      return;
    }

    let board = Array(9).fill(null);
    let currentPlayer = "X";
    let gameOver = false;

    const getPlayerNames = () =>
      typeof status.getNames === "function"
        ? status.getNames()
        : { X: "Player X", O: "Player O" };

    const clearInvalidAnnouncement = () => {
      if (invalidMoveRegion) {
        invalidMoveRegion.textContent = "";
      }
    };

    const announceInvalidMove = (reason) => {
      if (!invalidMoveRegion) {
        return;
      }

      const names = getPlayerNames();
      const playerName = names[currentPlayer] ?? `Player ${currentPlayer}`;

      let message = "";
      switch (reason) {
        case "occupied":
          message = `${playerName}, that square is already taken. Choose another space.`;
          break;
        case "game-over":
          message = "The round has finished. Select New round to keep playing.";
          break;
        default:
          message = String(reason);
          break;
      }

      invalidMoveRegion.textContent = "";
      window.requestAnimationFrame(() => {
        invalidMoveRegion.textContent = message;
      });
    };

    const disableAllCells = () => {
      cells.forEach((cell) => {
        cell.setAttribute("aria-disabled", "true");
      });
    };

    const clearCell = (cell) => {
      cell.textContent = "";
      cell.removeAttribute("data-mark");
      cell.classList.remove("cell--x", "cell--o", "cell--winner");
      cell.removeAttribute("aria-disabled");
    };

    const renderCell = (cell, player) => {
      cell.textContent = player;
      cell.dataset.mark = player;
      cell.classList.remove("cell--x", "cell--o");
      cell.classList.add(player === "X" ? "cell--x" : "cell--o");
      cell.setAttribute("aria-disabled", "true");
    };

    const findWinningLine = (player) =>
      WINNING_LINES.find((line) => line.every((index) => board[index] === player));

    const highlightWinner = (line) => {
      line.forEach((index) => {
        cells[index].classList.add("cell--winner");
      });
    };

    const isBoardFull = () => board.every((value) => value !== null);

    const isCellAvailable = (cell) => {
      if (!cell) {
        return false;
      }
      if (cell.dataset.mark) {
        return false;
      }
      return cell.getAttribute("aria-disabled") !== "true";
    };

    const focusCell = (index) => {
      const target = cells[index];
      if (target) {
        target.focus();
      }
    };

    const focusFirstAvailableCell = () => {
      const nextIndex = cells.findIndex((cell) => isCellAvailable(cell));
      if (nextIndex >= 0) {
        focusCell(nextIndex);
      }
    };

    const findNextAvailableIndex = (startIndex, deltaRow, deltaCol) => {
      if (!Number.isInteger(startIndex)) {
        return startIndex;
      }

      const totalCells = cells.length;
      let { row, col } = positionFromIndex(startIndex);

      for (let steps = 0; steps < totalCells; steps += 1) {
        row += deltaRow;
        col += deltaCol;
        ({ row, col } = wrapPosition(row, col));

        const candidateIndex = row * GRID_SIZE + col;
        const candidateCell = cells[candidateIndex];

        if (isCellAvailable(candidateCell)) {
          return candidateIndex;
        }
      }

      return startIndex;
    };

    const concludeRound = (result) => {
      gameOver = true;
      disableAllCells();

      if (result === "draw") {
        status.announceDraw();
        return;
      }

      status.announceWin(result);
      status.incrementScore(result);
    };

    const attemptMove = (index) => {
      if (gameOver) {
        announceInvalidMove("game-over");
        return false;
      }

      if (board[index]) {
        announceInvalidMove("occupied");
        return false;
      }

      const cell = cells[index];
      board[index] = currentPlayer;
      renderCell(cell, currentPlayer);
      clearInvalidAnnouncement();

      const winningLine = findWinningLine(currentPlayer);
      if (winningLine) {
        highlightWinner(winningLine);
        concludeRound(currentPlayer);
        return true;
      }

      if (isBoardFull()) {
        concludeRound("draw");
        return true;
      }

      currentPlayer = nextPlayer(currentPlayer);
      status.setTurn(currentPlayer);
      return true;
    };

    const startNewRound = () => {
      board = Array(9).fill(null);
      gameOver = false;
      currentPlayer = "X";
      cells.forEach((cell) => clearCell(cell));
      clearInvalidAnnouncement();
      status.setTurn(currentPlayer);
      focusFirstAvailableCell();
    };

    const resetGame = () => {
      status.resetScores();
      startNewRound();
    };

    const handleCellClick = (event) => {
      const cell = event.currentTarget;
      const index = Number(cell.dataset.index);
      attemptMove(index);
    };

    const handleCellKeyDown = (event) => {
      const index = Number(event.currentTarget.dataset.index);
      const { key } = event;

      if (key === "Enter" || key === " " || key === "Spacebar") {
        event.preventDefault();
        attemptMove(index);
        return;
      }

      const direction = KEY_TO_DIRECTION[key];
      if (!direction) {
        return;
      }

      event.preventDefault();
      const nextIndex = findNextAvailableIndex(index, direction.row, direction.col);
      if (nextIndex !== index) {
        focusCell(nextIndex);
      }
    };

    const handleNewRound = () => {
      startNewRound();
    };

    const handleResetGame = () => {
      resetGame();
    };

    const handleResetScores = () => {
      status.resetScores();
      clearInvalidAnnouncement();
    };

    cells.forEach((cell) => {
      cell.addEventListener("click", handleCellClick);
      cell.addEventListener("keydown", handleCellKeyDown);
    });

    newRoundButton?.addEventListener("click", handleNewRound);
    resetGameButton?.addEventListener("click", handleResetGame);
    resetScoresButton?.addEventListener("click", handleResetScores);

    startNewRound();
  });
})();
