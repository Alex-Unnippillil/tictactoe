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
  const MODE_PVP = "pvp";
  const MODE_CPU = "cpu";
  const AI_PLAYER = "O";
  const HUMAN_PLAYER = "X";
  const AI_DELAY_MIN = 200;
  const AI_DELAY_MAX = 400;
  const VALID_DIFFICULTIES = new Set(["easy", "normal", "hard"]);

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

  const normaliseMode = (value) => (value === MODE_CPU ? MODE_CPU : MODE_PVP);

  const normaliseDifficulty = (value) =>
    VALID_DIFFICULTIES.has(value) ? value : "normal";

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

  const boardToMatrix = (board) => {
    const matrix = [];
    for (let row = 0; row < 3; row += 1) {
      const start = row * 3;
      matrix.push([
        board[start] ?? "",
        board[start + 1] ?? "",
        board[start + 2] ?? "",
      ]);
    }
    return matrix;
  };

  const getEmptyIndices = (board) =>
    board.reduce((indices, value, index) => {
      if (!value) {
        indices.push(index);
      }
      return indices;
    }, []);

  const chooseRandomMove = (board) => {
    const empty = getEmptyIndices(board);
    if (!empty.length) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * empty.length);
    return empty[randomIndex];
  };

  const findImmediateWinningMove = (board, player) => {
    for (let i = 0; i < board.length; i += 1) {
      if (board[i]) {
        continue;
      }
      board[i] = player;
      const hasWinningLine = WINNING_LINES.some((line) =>
        line.every((index) => board[index] === player)
      );
      board[i] = null;
      if (hasWinningLine) {
        return i;
      }
    }
    return null;
  };

  const chooseNormalMove = (board, aiSymbol, humanSymbol) => {
    const winningMove = findImmediateWinningMove(board, aiSymbol);
    if (winningMove !== null) {
      return winningMove;
    }

    const blockingMove = findImmediateWinningMove(board, humanSymbol);
    if (blockingMove !== null) {
      return blockingMove;
    }

    if (!board[4]) {
      return 4;
    }

    const preferredCorners = [0, 2, 6, 8].filter((index) => !board[index]);
    if (preferredCorners.length) {
      const randomIndex = Math.floor(Math.random() * preferredCorners.length);
      return preferredCorners[randomIndex];
    }

    return chooseRandomMove(board);
  };

  const chooseMinimaxMove = (board, aiSymbol, humanSymbol) => {
    if (!window.MinimaxAI || typeof window.MinimaxAI.chooseMove !== "function") {
      return chooseRandomMove(board);
    }

    try {
      const result = window.MinimaxAI.chooseMove(
        boardToMatrix(board),
        aiSymbol,
        humanSymbol
      );
      if (!result || typeof result.row !== "number" || typeof result.col !== "number") {
        return chooseRandomMove(board);
      }
      return result.row * 3 + result.col;
    } catch (error) {
      console.warn("Unable to calculate minimax move", error);
      return chooseRandomMove(board);
    }
  };

  const chooseAiMove = (board, difficulty, aiSymbol, humanSymbol) => {
    switch (difficulty) {
      case "easy":
        return chooseRandomMove(board);
      case "hard":
        return chooseMinimaxMove(board, aiSymbol, humanSymbol);
      case "normal":
      default: {
        const normalMove = chooseNormalMove(board, aiSymbol, humanSymbol);
        if (normalMove !== null) {
          return normalMove;
        }
        return chooseRandomMove(board);
      }
    }
  };

  const randomAiDelay = () =>
    AI_DELAY_MIN + Math.floor(Math.random() * (AI_DELAY_MAX - AI_DELAY_MIN + 1));

  document.addEventListener("DOMContentLoaded", () => {
    const boardElement = document.getElementById("board");
    const cells = Array.from(document.querySelectorAll("[data-cell]"));
    const newRoundButton = document.getElementById("newRoundButton");
    const resetScoresButton = document.getElementById("resetScoresButton");
    const resetGameButton = document.getElementById("resetGameButton");
    const undoButton = document.getElementById("undoButton");
    const modeSelect = document.getElementById("modeSelect");
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
    let history = [];
    let mode = MODE_PVP;
    let difficulty = "normal";
    let pendingAiTimeout = null;

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
      cell.classList.remove("cell--x", "cell--o", "cell--winner");
      cell.classList.add(player === "X" ? "cell--x" : "cell--o");
      cell.setAttribute("aria-disabled", "true");
    };

    const clearWinnerHighlight = () => {
      cells.forEach((cell) => {
        cell.classList.remove("cell--winner");
      });
    };

    const applyWinnerHighlight = () => {
      if (!activeWinningLine) {
        return;
      }
      activeWinningLine.forEach((index) => {
        const cell = cells[index];
        if (cell) {
          cell.classList.add("cell--winner");
        }
      });
    };

    const findWinningLine = (player) =>
      WINNING_LINES.find((line) => line.every((index) => board[index] === player));

    const highlightWinner = (line) => {
      activeWinningLine = [...line];
      clearWinnerHighlight();
      applyWinnerHighlight();
    };

    const isBoardFull = () => board.every((value) => value !== null);

    const updateUndoButtonState = () => {
      if (undoButton) {
        undoButton.disabled = history.length === 0;
      }
    };

    const persistState = () => {
      const state = {
        board: [...board],
        currentPlayer,
        gameOver,
        winner: lastWinner,
        winningLine: activeWinningLine ? [...activeWinningLine] : null,
        scores: status.getScores(),
        mode,
        difficulty,
      };

      writePersistedState(state);
    };

    const cancelPendingAi = () => {
      if (pendingAiTimeout !== null) {
        window.clearTimeout(pendingAiTimeout);
        pendingAiTimeout = null;
      }
      if (boardElement) {
        boardElement.removeAttribute("data-thinking");
      }
      status.clearTemporaryMessage();
    };

    const isCpuMode = () => mode === MODE_CPU;
    const isAiTurn = () => isCpuMode() && !gameOver && currentPlayer === AI_PLAYER;

    const pushHistory = () => {
      history.push({
        board: [...board],
        currentPlayer,
        gameOver,
        lastWinner,
        activeWinningLine: activeWinningLine ? [...activeWinningLine] : null,
        scores: status.getScores(),
      });
      updateUndoButtonState();
    };

    const renderBoardFromState = () => {
      cells.forEach((cell, index) => {
        const mark = board[index];
        if (mark === "X" || mark === "O") {
          renderCell(cell, mark);
        } else {
          clearCell(cell);
        }
      });
      clearWinnerHighlight();
      applyWinnerHighlight();
      if (gameOver) {
        disableAllCells();
      }
    };

    const scheduleAiMove = () => {
      cancelPendingAi();
      if (!isAiTurn()) {
        return;
      }

      if (boardElement) {
        boardElement.setAttribute("data-thinking", "true");
      }
      status.showThinking();

      const delay = randomAiDelay();
      pendingAiTimeout = window.setTimeout(() => {
        pendingAiTimeout = null;
        if (boardElement) {
          boardElement.removeAttribute("data-thinking");
        }

        if (!isAiTurn()) {
          status.clearTemporaryMessage();
          return;
        }

        const moveIndex = chooseAiMove(board, difficulty, AI_PLAYER, HUMAN_PLAYER);
        status.clearTemporaryMessage();
        if (moveIndex === null) {
          return;
        }
        makeMove(moveIndex, { isAi: true });
      }, delay);
    };

    const updateModeUI = () => {
      if (modeSelect) {
        modeSelect.value = mode;
      }
      if (difficultySelect) {
        if (mode === MODE_CPU) {
          difficultySelect.removeAttribute("disabled");
        } else {
          difficultySelect.setAttribute("disabled", "true");
        }
      }
    };

    const updateDifficultyUI = () => {
      if (difficultySelect) {
        difficultySelect.value = difficulty;
      }
    };

    const startNewRound = () => {
      cancelPendingAi();
      board = Array(9).fill(null);
      gameOver = false;
      lastWinner = null;
      activeWinningLine = null;
      history = [];
      cells.forEach((cell) => clearCell(cell));
      clearWinnerHighlight();
      currentPlayer = HUMAN_PLAYER;
      status.setTurn(currentPlayer);
      updateUndoButtonState();
      persistState();
      if (isAiTurn()) {
        scheduleAiMove();
      }
    };

    const restoreState = () => {
      const saved = readPersistedState();
      history = [];
      updateUndoButtonState();
      cancelPendingAi();

      if (!saved) {
        status.resetScores();
        startNewRound();
        return;
      }

      board = normaliseBoard(saved.board);
      currentPlayer = saved.currentPlayer === AI_PLAYER ? AI_PLAYER : HUMAN_PLAYER;
      gameOver = Boolean(saved.gameOver);
      lastWinner = saved.winner === "X" || saved.winner === "O" ? saved.winner : null;
      activeWinningLine = normaliseWinningLine(saved.winningLine);
      mode = normaliseMode(saved.mode);
      difficulty = normaliseDifficulty(saved.difficulty);

      const savedScores = normaliseScores(saved.scores);
      if (savedScores) {
        status.setScores(savedScores);
      } else {
        status.resetScores();
      }

      renderBoardFromState();
      updateModeUI();
      updateDifficultyUI();

      if (gameOver) {
        if (lastWinner) {
          status.announceWin(lastWinner);
        } else {
          status.announceDraw();
        }
      } else {
        status.setTurn(currentPlayer);
        if (isAiTurn()) {
          scheduleAiMove();
        }
      }

      persistState();
    };

    const makeMove = (index, { isAi = false } = {}) => {
      if (gameOver || board[index]) {
        return;
      }

      pushHistory();

      board[index] = currentPlayer;
      renderCell(cells[index], currentPlayer);

      const winningLine = findWinningLine(currentPlayer);
      if (winningLine) {
        highlightWinner(winningLine);
        gameOver = true;
        lastWinner = currentPlayer;
        status.announceWin(currentPlayer);
        status.incrementScore(currentPlayer);
        disableAllCells();
        cancelPendingAi();
        persistState();
        updateUndoButtonState();
        return;
      }

      if (isBoardFull()) {
        gameOver = true;
        lastWinner = null;
        activeWinningLine = null;
        clearWinnerHighlight();
        status.announceDraw();
        disableAllCells();
        cancelPendingAi();
        persistState();
        updateUndoButtonState();
        return;
      }

      currentPlayer = nextPlayer(currentPlayer);
      status.setTurn(currentPlayer);
      persistState();
      if (!isAi && isAiTurn()) {
        scheduleAiMove();
      }
      updateUndoButtonState();
    };

    const handleCellClick = (event) => {
      if (gameOver || (isCpuMode() && currentPlayer === AI_PLAYER)) {
        return;
      }

      const cell = event.currentTarget;
      const index = Number(cell.dataset.index);
      if (!Number.isInteger(index) || index < 0 || index >= board.length) {
        return;
      }

      if (board[index]) {
        return;
      }

      makeMove(index, { isAi: false });
    };

    const handleNewRound = () => {
      startNewRound();
    };

    const handleResetGame = () => {
      cancelPendingAi();
      status.resetScores();
      startNewRound();
    };

    const handleResetScores = () => {
      status.resetScores();
      persistState();
    };

    const handleUndo = () => {
      if (!history.length) {
        return;
      }

      cancelPendingAi();

      const snapshot = history.pop();
      board = normaliseBoard(snapshot.board);
      currentPlayer = snapshot.currentPlayer === AI_PLAYER ? AI_PLAYER : HUMAN_PLAYER;
      gameOver = Boolean(snapshot.gameOver);
      lastWinner = snapshot.lastWinner === "X" || snapshot.lastWinner === "O" ? snapshot.lastWinner : null;
      activeWinningLine = normaliseWinningLine(snapshot.activeWinningLine);

      if (snapshot.scores) {
        status.setScores(snapshot.scores);
      } else {
        status.resetScores();
      }

      renderBoardFromState();

      if (gameOver) {
        if (lastWinner) {
          status.announceWin(lastWinner);
        } else {
          status.announceDraw();
        }
      } else {
        status.setTurn(currentPlayer);
      }

      updateUndoButtonState();
      persistState();

      if (isAiTurn()) {
        scheduleAiMove();
      }
    };

    const handleModeChange = (event) => {
      const nextMode = normaliseMode(event?.target?.value);
      if (mode === nextMode) {
        updateModeUI();
        return;
      }

      mode = nextMode;
      cancelPendingAi();
      updateModeUI();
      persistState();

      if (!gameOver && isAiTurn()) {
        scheduleAiMove();
      }
    };

    const handleDifficultyChange = (event) => {
      const nextDifficulty = normaliseDifficulty(event?.target?.value);
      if (difficulty === nextDifficulty) {
        updateDifficultyUI();
        return;
      }

      difficulty = nextDifficulty;
      updateDifficultyUI();
      cancelPendingAi();
      persistState();

      if (isAiTurn()) {
        scheduleAiMove();
      }
    };

    cells.forEach((cell) => {
      cell.addEventListener("click", handleCellClick);
    });

    newRoundButton?.addEventListener("click", handleNewRound);
    resetGameButton?.addEventListener("click", handleResetGame);
    resetScoresButton?.addEventListener("click", handleResetScores);
    undoButton?.addEventListener("click", handleUndo);
    modeSelect?.addEventListener("change", handleModeChange);
    difficultySelect?.addEventListener("change", handleDifficultyChange);

    updateModeUI();
    updateDifficultyUI();
    restoreState();
  });
})();
