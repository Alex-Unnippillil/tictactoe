(function () {
  const BOARD_SIZE = 3;
  const DEFAULT_NAMES = {
    X: "Player X",
    O: "Player O",
  };
  const DEFAULT_SCORES = {
    X: 0,
    O: 0,
  };
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
  const NAME_PATTERN = /^[\p{L}\p{N}](?:[\p{L}\p{N}\s'.-]{0,23})$/u;
  const NAME_STORAGE_KEY = "tictactoe:names";
  const SCORE_STORAGE_KEY = "tictactoe:scores";
  const INVALID_MESSAGE =
    "Use letters, numbers, spaces, apostrophes, periods or hyphens only.";

  const cells = Array.from(document.querySelectorAll("[data-cell]"));
  const statusMessage = document.getElementById("statusMessage");
  const newRoundButton = document.getElementById("newRoundButton");
  const settingsButton = document.getElementById("settingsButton");
  const resetGameButton = document.getElementById("resetGameButton");
  const resetScoresButton = document.getElementById("resetScoresButton");
  const settingsModal = document.getElementById("settingsModal");
  const settingsForm = document.getElementById("settingsForm");
  const cancelSettingsButton = document.getElementById("settingsCancelButton");

  if (!cells.length || !statusMessage) {
    return;
  }

  const nameElements = {
    X: document.querySelector('[data-role="name"][data-player="X"]'),
    O: document.querySelector('[data-role="name"][data-player="O"]'),
  };
  const scoreElements = {
    X: document.querySelector('[data-role="score"][data-player="X"]'),
    O: document.querySelector('[data-role="score"][data-player="O"]'),
  };

  const settingsFields = {
    X: {
      input: document.getElementById("playerXName"),
      error: document.querySelector('[data-error-for="playerX"]'),
    },
    O: {
      input: document.getElementById("playerOName"),
      error: document.querySelector('[data-error-for="playerO"]'),
    },
  };

  let board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
  let currentPlayer = "X";
  let gameOver = false;
  let playerNames = normalisePersistedNames(
    loadStoredObject(NAME_STORAGE_KEY, DEFAULT_NAMES)
  );
  let scores = normalisePersistedScores(
    loadStoredObject(SCORE_STORAGE_KEY, DEFAULT_SCORES)
  );

  function loadStoredObject(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return { ...fallback };
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return { ...fallback };
      }
      return { ...fallback, ...parsed };
    } catch (error) {
      console.warn("Unable to read data from storage", error);
      return { ...fallback };
    }
  }

  function persistObject(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Unable to persist data", error);
    }
  }

  function sanitisePersistedName(value, fallback) {
    const normalised = sanitiseName(value, fallback);
    return normalised === null ? fallback : normalised;
  }

  function normalisePersistedNames(names) {
    return {
      X: sanitisePersistedName(names?.X, DEFAULT_NAMES.X),
      O: sanitisePersistedName(names?.O, DEFAULT_NAMES.O),
    };
  }

  function normaliseScoreValue(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) {
      return 0;
    }
    return Math.trunc(number);
  }

  function normalisePersistedScores(values) {
    return {
      X: normaliseScoreValue(values?.X),
      O: normaliseScoreValue(values?.O),
    };
  }

  function sanitiseName(value, fallback) {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (!trimmed) {
      return fallback;
    }
    return NAME_PATTERN.test(trimmed) ? trimmed : null;
  }

  function updateScoreboard() {
    if (scoreElements.X) {
      scoreElements.X.textContent = String(scores.X);
    }
    if (scoreElements.O) {
      scoreElements.O.textContent = String(scores.O);
    }
  }

  function updateNameDisplay() {
    if (nameElements.X) {
      nameElements.X.textContent = playerNames.X;
    }
    if (nameElements.O) {
      nameElements.O.textContent = playerNames.O;
    }
    refreshCellLabels();
  }

  function refreshCellLabels() {
    cells.forEach((cell) => {
      const index = Number(cell.dataset.index);
      const row = Math.floor(index / BOARD_SIZE) + 1;
      const col = (index % BOARD_SIZE) + 1;
      const occupant = board[index];
      if (occupant) {
        const name = playerNames[occupant] || occupant;
        cell.setAttribute(
          "aria-label",
          `Row ${row} column ${col}, ${name} placed ${occupant}`
        );
      } else {
        cell.setAttribute("aria-label", `Row ${row} column ${col}, empty`);
      }
    });
  }

  function setStatus(message) {
    statusMessage.textContent = message;
  }

  function setTurnStatus() {
    const name = playerNames[currentPlayer] || currentPlayer;
    setStatus(`${name} (${currentPlayer}) to move`);
  }

  function setWinStatus(player) {
    const name = playerNames[player] || player;
    setStatus(`${name} (${player}) wins this round!`);
  }

  function setDrawStatus() {
    setStatus("It's a draw!");
  }

  function refreshStatusForCurrentState() {
    if (gameOver) {
      const outcome = evaluateBoard();
      if (outcome?.winner) {
        setWinStatus(outcome.winner);
        return;
      }
      if (outcome?.draw) {
        setDrawStatus();
        return;
      }
    }

    setTurnStatus();
  }

  function disableAllCells() {
    cells.forEach((cell) => {
      cell.disabled = true;
      cell.setAttribute("aria-disabled", "true");
    });
  }

  function enableAllCells() {
    cells.forEach((cell) => {
      cell.disabled = false;
      cell.setAttribute("aria-disabled", "false");
    });
  }

  function clearBoardUI() {
    cells.forEach((cell) => {
      cell.textContent = "";
      cell.classList.remove("cell--x", "cell--o", "cell--winner");
    });
    refreshCellLabels();
  }

  function resetBoard() {
    board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
    currentPlayer = "X";
    gameOver = false;
    enableAllCells();
    clearBoardUI();
    setTurnStatus();
  }

  function resetScores() {
    scores = { ...DEFAULT_SCORES };
    updateScoreboard();
    persistObject(SCORE_STORAGE_KEY, scores);
  }

  function handleWin(player, winningLine) {
    gameOver = true;
    winningLine.forEach((index) => {
      const cell = cells[index];
      if (!cell) {
        return;
      }
      cell.classList.add("cell--winner");
    });
    disableAllCells();
    scores[player] = (scores[player] || 0) + 1;
    updateScoreboard();
    persistObject(SCORE_STORAGE_KEY, scores);
    setWinStatus(player);
  }

  function handleDraw() {
    gameOver = true;
    disableAllCells();
    setDrawStatus();
  }

  function evaluateBoard() {
    for (let i = 0; i < WINNING_LINES.length; i += 1) {
      const [a, b, c] = WINNING_LINES[i];
      const mark = board[a];
      if (mark && mark === board[b] && mark === board[c]) {
        return { winner: mark, line: WINNING_LINES[i] };
      }
    }

    if (board.every((cell) => cell)) {
      return { draw: true };
    }

    return null;
  }

  function markCell(cell, player) {
    cell.textContent = player;
    cell.classList.add(player === "X" ? "cell--x" : "cell--o");
    cell.disabled = true;
    cell.setAttribute("aria-disabled", "true");
  }

  function handleCellClick(event) {
    const cell = event.currentTarget;
    const index = Number(cell.dataset.index);
    if (!Number.isInteger(index) || gameOver || board[index]) {
      return;
    }

    board[index] = currentPlayer;
    markCell(cell, currentPlayer);
    refreshCellLabels();

    const outcome = evaluateBoard();
    if (outcome?.winner) {
      handleWin(outcome.winner, outcome.line);
      return;
    }

    if (outcome?.draw) {
      handleDraw();
      return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    setTurnStatus();
  }

  function populateSettingsForm() {
    if (!settingsForm) {
      return;
    }
    if (settingsFields.X.input) {
      settingsFields.X.input.value = playerNames.X;
    }
    if (settingsFields.O.input) {
      settingsFields.O.input.value = playerNames.O;
    }
    clearFieldError(settingsFields.X);
    clearFieldError(settingsFields.O);
  }

  function openSettingsModal() {
    if (!settingsModal) {
      return;
    }
    populateSettingsForm();
    settingsModal.classList.remove("is-closing");
    if (typeof settingsModal.showModal === "function") {
      settingsModal.showModal();
    } else {
      settingsModal.setAttribute("open", "true");
    }
    window.setTimeout(() => {
      settingsFields.X.input?.focus();
    }, 0);
  }

  function closeSettingsModal() {
    if (!settingsModal) {
      return;
    }
    if (!settingsModal.hasAttribute("open")) {
      return;
    }

    if (settingsModal.classList.contains("is-closing")) {
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finishClose = () => {
      settingsModal.classList.remove("is-closing");
      if (typeof settingsModal.close === "function") {
        settingsModal.close();
      } else {
        settingsModal.removeAttribute("open");
      }
    };

    if (reduceMotion) {
      finishClose();
      return;
    }

    const handleTransitionEnd = (event) => {
      if (event.target !== settingsModal) {
        return;
      }
      settingsModal.removeEventListener("transitionend", handleTransitionEnd);
      finishClose();
    };

    settingsModal.addEventListener("transitionend", handleTransitionEnd);
    settingsModal.classList.add("is-closing");
    window.setTimeout(() => {
      if (!settingsModal.classList.contains("is-closing")) {
        return;
      }
      settingsModal.removeEventListener("transitionend", handleTransitionEnd);
      finishClose();
    }, 400);
  }

  function clearFieldError(field) {
    if (!field) {
      return;
    }
    field.input?.classList.remove("is-invalid");
    field.input?.removeAttribute("aria-invalid");
    const control = field.input?.closest(".field__control");
    if (control) {
      control.classList.remove("is-invalid");
    }
    if (field.error) {
      field.error.hidden = true;
      field.error.setAttribute("aria-hidden", "true");
      field.error.textContent = "";
    }
  }

  function showFieldError(field, message) {
    if (!field) {
      return;
    }
    field.input?.classList.add("is-invalid");
    field.input?.setAttribute("aria-invalid", "true");
    const control = field.input?.closest(".field__control");
    if (control) {
      control.classList.add("is-invalid");
    }
    if (field.error) {
      field.error.hidden = false;
      field.error.setAttribute("aria-hidden", "false");
      field.error.textContent = message;
    }
  }

  function configureFieldAccessibility(field) {
    if (!field?.input) {
      return;
    }

    const { input, error } = field;

    if (error) {
      error.setAttribute("role", "alert");
      error.setAttribute("aria-live", "polite");
      error.setAttribute("aria-hidden", error.hidden ? "true" : "false");

      if (error.id) {
        const describedBy = input.getAttribute("aria-describedby") || "";
        const tokens = new Set(describedBy.split(/\s+/).filter(Boolean));
        tokens.add(error.id);
        input.setAttribute("aria-describedby", Array.from(tokens).join(" "));
      }
    }
  }

  function validateField(field, fallback) {
    if (!field?.input) {
      return fallback;
    }

    const value = field.input.value;
    const normalised = sanitiseName(value, fallback);

    if (normalised === null) {
      showFieldError(field, INVALID_MESSAGE);
      return null;
    }

    clearFieldError(field);
    return normalised;
  }

  function applyNames(nextNames) {
    playerNames = { ...playerNames, ...nextNames };
    persistObject(NAME_STORAGE_KEY, playerNames);
    updateNameDisplay();
    refreshStatusForCurrentState();
  }

  function handleSettingsSubmit(event) {
    event.preventDefault();
    const nameX = validateField(settingsFields.X, DEFAULT_NAMES.X);
    const nameO = validateField(settingsFields.O, DEFAULT_NAMES.O);

    if (nameX === null || nameO === null) {
      const firstInvalid =
        nameX === null ? settingsFields.X.input : settingsFields.O.input;
      firstInvalid?.focus();
      return;
    }

    applyNames({
      X: nameX || DEFAULT_NAMES.X,
      O: nameO || DEFAULT_NAMES.O,
    });

    closeSettingsModal();
  }

  function attachEventListeners() {
    cells.forEach((cell) => {
      cell.addEventListener("click", handleCellClick);
    });

    newRoundButton?.addEventListener("click", (event) => {
      event.preventDefault();
      resetBoard();
    });

    resetGameButton?.addEventListener("click", (event) => {
      event.preventDefault();
      resetBoard();
      resetScores();
    });

    resetScoresButton?.addEventListener("click", (event) => {
      event.preventDefault();
      resetScores();
    });

    settingsButton?.addEventListener("click", (event) => {
      event.preventDefault();
      openSettingsModal();
    });

    cancelSettingsButton?.addEventListener("click", (event) => {
      event.preventDefault();
      closeSettingsModal();
    });

    settingsForm?.addEventListener("submit", handleSettingsSubmit);

    if (settingsModal instanceof HTMLDialogElement) {
      settingsModal.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeSettingsModal();
      });
    }

    Object.entries(settingsFields).forEach(([key, field]) => {
      configureFieldAccessibility(field);

      field.input?.addEventListener("input", () => {
        if (field.error && !field.error.hidden) {
          validateField(field, DEFAULT_NAMES[key]);
        } else if (field.input?.classList.contains("is-invalid")) {
          validateField(field, DEFAULT_NAMES[key]);
        }
      });

      field.input?.addEventListener("blur", () => {
        validateField(field, DEFAULT_NAMES[key]);
      });
    });
  }

  function init() {
    persistObject(NAME_STORAGE_KEY, playerNames);
    persistObject(SCORE_STORAGE_KEY, scores);
    updateScoreboard();
    updateNameDisplay();
    resetBoard();
    attachEventListeners();
  }

  init();
})();
