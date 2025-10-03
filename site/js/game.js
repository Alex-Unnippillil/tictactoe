(function () {
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

  document.addEventListener("DOMContentLoaded", () => {
    const cells = Array.from(document.querySelectorAll("[data-cell]"));
    const newRoundButton = document.getElementById("newRoundButton");
    const resetScoresButton = document.getElementById("resetScoresButton");
    const resetGameButton = document.getElementById("resetGameButton");
    const status = window.uiStatus;

    if (!status) {
      throw new Error("Status UI has not been initialised");
    }

    let board = Array(9).fill(null);
    let currentPlayer = "X";
    let gameOver = false;

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

    const startNewRound = () => {
      board = Array(9).fill(null);
      gameOver = false;
      cells.forEach((cell) => clearCell(cell));
      currentPlayer = "X";
      status.setTurn(currentPlayer);
    };

    const resetGame = () => {
      status.resetScores();
      startNewRound();
    };

    const handleCellClick = (event) => {
      if (gameOver) {
        return;
      }

      const cell = event.currentTarget;
      const index = Number(cell.dataset.index);

      if (board[index]) {
        return;
      }

      board[index] = currentPlayer;
      renderCell(cell, currentPlayer);

      const winningLine = findWinningLine(currentPlayer);
      if (winningLine) {
        highlightWinner(winningLine);
        gameOver = true;
        status.announceWin(currentPlayer);
        status.incrementScore(currentPlayer);
        disableAllCells();
        return;
      }

      if (isBoardFull()) {
        gameOver = true;
        status.announceDraw();
        disableAllCells();
        return;
      }

      currentPlayer = nextPlayer(currentPlayer);
      status.setTurn(currentPlayer);
    };

    const handleNewRound = () => {
      startNewRound();
    };

    const handleResetGame = () => {
      resetGame();
    };

    const handleResetScores = () => {
      status.resetScores();
    };

    cells.forEach((cell) => {
      cell.addEventListener("click", handleCellClick);
    });

    newRoundButton?.addEventListener("click", handleNewRound);
    resetGameButton?.addEventListener("click", handleResetGame);
    resetScoresButton?.addEventListener("click", handleResetScores);

    startNewRound();
  });
})();
