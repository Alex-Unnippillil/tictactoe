(function () {
  const WINNING_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  const STORAGE_KEY = "tictactoe:game-state";
  const HUMAN_PLAYER = "X";
  const AI_PLAYER = "O";
  const DEFAULT_DIFFICULTY = "human";
  const VALID_DIFFICULTIES = new Set(["human", "easy", "impossible"]);
  const AI_MOVE_DELAY_MS = 250;

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
      O: parseScore(value.O)
    };
  };

  const normaliseDifficulty = (value) => {
    if (typeof value !== "string") {
      return DEFAULT_DIFFICULTY;
    }

    return VALID_DIFFICULTIES.has(value) ? value : DEFAULT_DIFFICULTY;
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

  const createBoardMatrix = (flatBoard) => {
    const matrix = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""]
    ];

    flatBoard.forEach((value, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      matrix[row][col] = value === "X" || value === "O" ? value : "";
    });

    return matrix;
  };

  document.addEventListener("DOMContentLoaded", () => {
    const cells = Array.from(document.querySelectorAll("[data-cell]"));
    const newRoundButton = document.getElementById("newRoundButton");
    const resetScoresButton = document.getElementById("resetScoresButton");
    const resetGameButton = document.getElementById("resetGameButton");
    const difficultySelect = document.getElementById("difficultySelect");
    const status = window.uiStatus;

    if (!status) {
      throw new Error("Status UI has not been initialised");
    }

    let board = Array(9).fill(null);
    let currentPlayer = HUMAN_PLAYER;
    let gameOver = false;
    let lastWinner = null;
    let activeWinningLine = null;
    let aiDifficulty = DEFAULT_DIFFICULTY;
    let aiTimeoutId = null;

    const isAiEnabled = () => aiDifficulty !== "human";
    const isAiTurn = () => !gameOver && isAiEnabled() && currentPlayer === AI_PLAYER;

    const cancelAiMove = () => {
      if (aiTimeoutId !== null) {
        window.clearTimeout(aiTimeoutId);
        aiTimeoutId = null;
      }
    };

    const getAvailableMoves = () =>
      board.reduce((moves, value, index) => {
        if (value === null) {
          moves.push(index);
        }
        return moves;
      }, []);

    const chooseRandomMove = () => {
      const available = getAvailableMoves();
      if (!available.length) {
        return null;
      }

      const randomIndex = Math.floor(Math.random() * available.length);
      return available[randomIndex];
    };

    const chooseMinimaxMove = () => {
      const ai = window.MinimaxAI;
      if (!ai || typeof ai.chooseMove !== "function") {
        return null;
      }

      try {
        const boardMatrix = createBoardMatrix(board);
        const result = ai.chooseMove(boardMatrix, AI_PLAYER, HUMAN_PLAYER);
        if (!result || typeof result.row !== "number" || typeof result.col !== "number") {
          return null;
        }

        const index = result.row * 3 + result.col;
        if (board[index] !== null) {
          return null;
        }

        return index;
      } catch (error) {
        console.error("Unable to determine minimax move", error);
        return null;
      }
    };

    const chooseAiMoveIndex = () => {
      if (!isAiEnabled()) {
        return null;
      }

      const available = getAvailableMoves();
      if (!available.length) {
        return null;
      }

      if (aiDifficulty === "impossible") {
        const minimaxChoice = chooseMinimaxMove();
        if (minimaxChoice !== null) {
          return minimaxChoice;
        }
      }

      return available[Math.floor(Math.random() * available.length)];
    };

    const executeAiMove = () => {
      aiTimeoutId = null;
      if (!isAiTurn()) {
        return;
      }

      const index = chooseAiMoveIndex();
      if (index === null || board[index] !== null) {
        return;
      }

      applyMove(index, AI_PLAYER);
    };

    const scheduleAiMoveIfNeeded = () => {
      cancelAiMove();
      if (!isAiTurn()) {
        return;
      }

      aiTimeoutId = window.setTimeout(executeAiMove, AI_MOVE_DELAY_MS);
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
        difficulty: aiDifficulty
      };

      writePersistedState(state);
    };

    const setDifficulty = (value, options = {}) => {
      const { persist = true, schedule = true } = options;
      aiDifficulty = normaliseDifficulty(value);
      if (difficultySelect) {
        difficultySelect.value = aiDifficulty;
      }

      cancelAiMove();

      if (persist) {
        persistState();
      }

      if (schedule) {
        scheduleAiMoveIfNeeded();
      }
    };

    const restoreState = () => {
      cancelAiMove();
      const saved = readPersistedState();
      if (!saved) {
        status.resetScores();
        setDifficulty(DEFAULT_DIFFICULTY, { persist: false, schedule: false });
        startNewRound({ persist: false });
        persistState();
        return;
      }

      board = normaliseBoard(saved.board);
      currentPlayer = saved.currentPlayer === AI_PLAYER ? AI_PLAYER : HUMAN_PLAYER;
      gameOver = Boolean(saved.gameOver);
      lastWinner = saved.winner === HUMAN_PLAYER || saved.winner === AI_PLAYER ? saved.winner : null;
      activeWinningLine = normaliseWinningLine(saved.winningLine);

      const savedScores = normaliseScores(saved.scores);
      if (savedScores) {
        status.setScores(savedScores);
      } else {
        status.resetScores();
      }

      setDifficulty(saved.difficulty, { persist: false, schedule: false });

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
        scheduleAiMoveIfNeeded();
      }

      persistState();
    };

    const startNewRound = (options = {}) => {
      const { persist = true } = options;
      cancelAiMove();
      board = Array(9).fill(null);
      gameOver = false;
      lastWinner = null;
      activeWinningLine = null;
      cells.forEach((cell) => clearCell(cell));
      currentPlayer = HUMAN_PLAYER;
      status.setTurn(currentPlayer);
      if (persist) {
        persistState();
      }
      scheduleAiMoveIfNeeded();
    };

    const resetGame = () => {
      status.resetScores();
      startNewRound();
    };

    const applyMove = (index, player) => {
      if (gameOver) {
        return false;
      }

      if (board[index] !== null) {
        return false;
      }

      if (currentPlayer !== player) {
        return false;
      }

      cancelAiMove();
      board[index] = player;
      renderCell(cells[index], player);

      const winningLine = findWinningLine(player);
      if (winningLine) {
        highlightWinner(winningLine);
        gameOver = true;
        lastWinner = player;
        status.announceWin(player);
        status.incrementScore(player);
        disableAllCells();
        persistState();
        return true;
      }

      if (isBoardFull()) {
        gameOver = true;
        lastWinner = null;
        activeWinningLine = null;
        status.announceDraw();
        disableAllCells();
        persistState();
        return true;
      }

      currentPlayer = nextPlayer(player);
      status.setTurn(currentPlayer);
      persistState();
      scheduleAiMoveIfNeeded();
      return true;
    };

    const handleCellClick = (event) => {
      if (gameOver || isAiTurn()) {
        return;
      }

      const cell = event.currentTarget;
      const index = Number(cell.dataset.index);
      if (!Number.isInteger(index)) {
        return;
      }

      applyMove(index, currentPlayer);
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
      scheduleAiMoveIfNeeded();
    };

    cells.forEach((cell) => {
      cell.addEventListener("click", handleCellClick);
    });

    newRoundButton?.addEventListener("click", handleNewRound);
    resetGameButton?.addEventListener("click", handleResetGame);
    resetScoresButton?.addEventListener("click", handleResetScores);

    difficultySelect?.addEventListener("change", (event) => {
      const target = event.target;
      setDifficulty(target.value);
    });

    restoreState();
  });
})();
