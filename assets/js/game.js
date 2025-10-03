(function () {
  const BOARD_SIZE = 3;
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

  const nextPlayer = (player) => (player === "X" ? "O" : "X");

  const findWinningLine = (board, player) =>
    WINNING_LINES.find((line) => line.every((index) => board[index] === player));

  const isBoardFull = (board) => board.every((value) => value !== null);

  const setCellFocus = (cells, index) => {
    cells.forEach((cell, cellIndex) => {
      cell.tabIndex = cellIndex === index ? 0 : -1;
    });
    cells[index]?.focus();
  };

  const getNeighbourIndex = (currentIndex, key) => {
    const row = Math.floor(currentIndex / BOARD_SIZE);
    const col = currentIndex % BOARD_SIZE;

    switch (key) {
      case "ArrowUp":
        return ((row + BOARD_SIZE - 1) % BOARD_SIZE) * BOARD_SIZE + col;
      case "ArrowDown":
        return ((row + 1) % BOARD_SIZE) * BOARD_SIZE + col;
      case "ArrowLeft":
        return row * BOARD_SIZE + ((col + BOARD_SIZE - 1) % BOARD_SIZE);
      case "ArrowRight":
        return row * BOARD_SIZE + ((col + 1) % BOARD_SIZE);
      case "Home":
        return row * BOARD_SIZE;
      case "End":
        return row * BOARD_SIZE + (BOARD_SIZE - 1);
      case "PageUp":
        return col;
      case "PageDown":
        return (BOARD_SIZE - 1) * BOARD_SIZE + col;
      default:
        return currentIndex;
    }
  };

  const focusNextAvailableCell = (cells, board, startIndex = 0) => {
    for (let i = 0; i < cells.length; i += 1) {
      const index = (startIndex + i) % cells.length;
      if (!board[index]) {
        setCellFocus(cells, index);
        return;
      }
    }
  };

  const disableAllCells = (cells) => {
    cells.forEach((cell) => {
      cell.disabled = true;
      cell.setAttribute("aria-disabled", "true");
      cell.tabIndex = -1;
    });
  };

  const clearCell = (cell) => {
    cell.textContent = "";
    cell.removeAttribute("data-mark");
    cell.classList.remove("cell--x", "cell--o", "cell--winner");
    cell.removeAttribute("aria-disabled");
    cell.disabled = false;
    cell.tabIndex = -1;
  };

  const renderCell = (cell, player) => {
    cell.textContent = player;
    cell.dataset.mark = player;
    cell.classList.remove("cell--x", "cell--o");
    cell.classList.add(player === "X" ? "cell--x" : "cell--o");
    cell.setAttribute("aria-disabled", "true");
    cell.disabled = true;
    cell.tabIndex = -1;
  };

  document.addEventListener("DOMContentLoaded", () => {
    const boardElement = document.getElementById("board");
    const cells = boardElement ? Array.from(boardElement.querySelectorAll("[data-cell]")) : [];
    const newRoundButton = document.getElementById("newRoundButton");
    const resetScoresButton = document.getElementById("resetScoresButton");
    const resetGameButton = document.getElementById("resetGameButton");
    const status = window.uiStatus;

    if (!boardElement || cells.length !== BOARD_SIZE * BOARD_SIZE || !status) {
      console.error("Game initialisation failed: missing board or status UI.");
      return;
    }

    let board = Array(cells.length).fill(null);
    let currentPlayer = "X";
    let gameOver = false;

    const highlightWinner = (line) => {
      line.forEach((index) => {
        cells[index].classList.add("cell--winner");
      });
    };

    const resetBoardState = () => {
      board = Array(cells.length).fill(null);
      gameOver = false;
      cells.forEach((cell) => clearCell(cell));
      currentPlayer = "X";
      status.setTurn(currentPlayer);
      setCellFocus(cells, 0);
    };

    const resetGame = () => {
      status.resetScores();
      resetBoardState();
    };

    const handleMove = (index) => {
      if (gameOver || board[index]) {
        return;
      }

      board[index] = currentPlayer;
      renderCell(cells[index], currentPlayer);

      const winningLine = findWinningLine(board, currentPlayer);
      if (winningLine) {
        highlightWinner(winningLine);
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
      focusNextAvailableCell(cells, board, index + 1);
    };

    const handleCellClick = (event) => {
      const index = Number(event.currentTarget.dataset.index);
      handleMove(index);
    };

    const handleCellKeyDown = (event) => {
      const index = Number(event.currentTarget.dataset.index);
      if (Number.isNaN(index)) {
        return;
      }

      switch (event.key) {
        case " ":
        case "Enter":
          event.preventDefault();
          handleMove(index);
          break;
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
        case "Home":
        case "End":
        case "PageUp":
        case "PageDown":
          event.preventDefault();
          setCellFocus(cells, getNeighbourIndex(index, event.key));
          break;
        default:
          break;
      }
    };

    const handleBoardFocusIn = (event) => {
      const target = event.target;
      if (!target.matches("[data-cell]")) {
        return;
      }

      const index = Number(target.dataset.index);
      if (!Number.isNaN(index)) {
        setCellFocus(cells, index);
      }
    };

    cells.forEach((cell) => {
      cell.addEventListener("click", handleCellClick);
      cell.addEventListener("keydown", handleCellKeyDown);
    });

    boardElement.addEventListener("focusin", handleBoardFocusIn);

    newRoundButton?.addEventListener("click", () => {
      resetBoardState();
    });

    resetGameButton?.addEventListener("click", () => {
      resetGame();
    });

    resetScoresButton?.addEventListener("click", () => {
      status.resetScores();
    });

    resetBoardState();
  });
})();
