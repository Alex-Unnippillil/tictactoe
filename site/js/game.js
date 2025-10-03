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
  const STORAGE_KEY = "tictactoe:game-state";
  const MODE_STORAGE_KEY = "tictactoe:game-mode";
  const DEFAULT_MODE = "human";
  const MODE_OPTIONS = new Set(["human", "easy", "medium", "hard"]);

  const nextPlayer = (player) => (player === "X" ? "O" : "X");

  const normaliseBoard = (value) => {
    if (!Array.isArray(value) || value.length !== 9) {
      return Array(9).fill(null);
    }

    return value.map((cell) => (cell === "X" || cell === "O" ? cell : null));
  };

  const normaliseWinningLine = (value) => {
    if (!Array.isArray(value)) {
      return null;
    }

    const filtered = value
      .map((index) => (Number.isInteger(index) ? index : null))
      .filter((index) => index !== null && index >= 0 && index < 9);

    return filtered.length === 3 ? filtered : null;
  };

  const parseScore = (input) => {
    const number = Number(input);
    if (!Number.isFinite(number) || number < 0) {
      return 0;
    }

    return Math.trunc(number);
  };

  const normaliseScores = (value) => {
    if (!value || typeof value !== "object") {
      return null;
    }

    return {
      X: parseScore(value.X),
      O: parseScore(value.O),
    };
  };

  const normaliseMode = (value) =>
    MODE_OPTIONS.has(value) ? value : DEFAULT_MODE;

  const readPersistedMode = () => {
    try {
      const stored = window.localStorage.getItem(MODE_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      return normaliseMode(stored);
    } catch (error) {
      console.warn("Unable to load saved game mode", error);
      return null;
    }
  };

  const writePersistedMode = (mode) => {
    try {
      window.localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.warn("Unable to persist game mode", error);
    }
  };

  const readPersistedState = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn("Unable to load saved game state", error);
      return null;
    }
  };

  const writePersistedState = (state) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Unable to persist game state", error);
    }
  };

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
    let lastWinner = null;
    let activeWinningLine = null;
    let currentMode = readPersistedMode() ?? DEFAULT_MODE;

    const updateMode = (mode) => {
      const normalised = normaliseMode(mode);
      currentMode = normalised;
      if (typeof status.setMode === "function") {
        status.setMode(normalised);
      }
      writePersistedMode(normalised);
    };

    updateMode(currentMode);

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
      activeWinningLine = [...line];
      line.forEach((index) => {
        cells[index].classList.add("cell--winner");
      });
    };

    const isBoardFull = () => board.every((value) => value !== null);

    const persistState = () => {
      const state = {
        board: [...board],
        currentPlayer,
        gameOver,
        winner: lastWinner,
        winningLine: activeWinningLine ? [...activeWinningLine] : null,
        scores: status.getScores(),
        mode: currentMode,
      };

      writePersistedState(state);
    };

    const restoreState = () => {
      const saved = readPersistedState();
      if (!saved) {
        startNewRound();
        return;
      }

      board = normaliseBoard(saved.board);
      currentPlayer = saved.currentPlayer === "O" ? "O" : "X";
      gameOver = Boolean(saved.gameOver);
      lastWinner = saved.winner === "X" || saved.winner === "O" ? saved.winner : null;
      activeWinningLine = normaliseWinningLine(saved.winningLine);

      if (typeof saved.mode === "string") {
        updateMode(saved.mode);
      }

      const savedScores = normaliseScores(saved.scores);
      if (savedScores) {
        status.setScores(savedScores);
      } else {
        status.resetScores();
      }

      cells.forEach((cell, index) => {
        const mark = board[index];
        if (mark === "X" || mark === "O") {
          renderCell(cell, mark);
        } else {
          clearCell(cell);
        }
      });

      if (gameOver) {
        if (activeWinningLine && activeWinningLine.length === 3) {
          highlightWinner(activeWinningLine);
        }
        disableAllCells();
        if (lastWinner) {
          status.announceWin(lastWinner);
        } else {
          status.announceDraw();
        }
      } else {
        status.setTurn(currentPlayer);
      }

      persistState();
    };

    const startNewRound = () => {
      board = Array(9).fill(null);
      gameOver = false;
      lastWinner = null;
      activeWinningLine = null;
      cells.forEach((cell) => clearCell(cell));
      currentPlayer = "X";
      status.setTurn(currentPlayer);
      persistState();
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
        lastWinner = currentPlayer;
        status.announceWin(currentPlayer);
        status.incrementScore(currentPlayer);
        disableAllCells();
        persistState();
        return;
      }

      if (isBoardFull()) {
        gameOver = true;
        lastWinner = null;
        activeWinningLine = null;
        status.announceDraw();
        disableAllCells();
        persistState();
        return;
      }

      currentPlayer = nextPlayer(currentPlayer);
      status.setTurn(currentPlayer);
      persistState();
    };

    const handleNewRound = () => {
      startNewRound();
    };

    const handleResetGame = () => {
      resetGame();
    };

    const handleResetScores = () => {
      status.resetScores();
      persistState();
    };

    cells.forEach((cell) => {
      cell.addEventListener("click", handleCellClick);
    });

    newRoundButton?.addEventListener("click", handleNewRound);
    resetGameButton?.addEventListener("click", handleResetGame);
    resetScoresButton?.addEventListener("click", handleResetScores);

    document.addEventListener("settings:players-updated", (event) => {
      const modeValue = event?.detail?.mode;
      if (typeof modeValue !== "string") {
        return;
      }
      const nextMode = normaliseMode(modeValue);
      if (nextMode === currentMode) {
        return;
      }
      updateMode(nextMode);
      persistState();
    });

    restoreState();
  });
})();
