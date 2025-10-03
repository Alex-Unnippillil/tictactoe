(function () {
  const DEFAULT_NAMES = {
    X: "Player X",
    O: "Player O",
  };
  const DEFAULT_SCORES = { X: 0, O: 0 };
  const SCORES_STORAGE_KEY = "tictactoe:scores";
  const NAMES_STORAGE_KEY = "tictactoe:player-names";
  const storage =
    window.appStorage && typeof window.appStorage === "object"
      ? window.appStorage
      : {
          readJson(key, validator) {
            try {
              const raw = window.localStorage.getItem(key);
              if (raw === null) {
                return null;
              }
              const parsed = JSON.parse(raw);
              if (validator && !validator(parsed)) {
                return null;
              }
              return parsed;
            } catch (error) {
              console.warn(`Unable to read persisted data for ${key}`, error);
              return null;
            }
          },
          writeJson(key, value) {
            try {
              window.localStorage.setItem(key, JSON.stringify(value));
              return true;
            } catch (error) {
              console.warn(`Unable to persist data for ${key}`, error);
              return false;
            }
          },
          remove(key) {
            try {
              window.localStorage.removeItem(key);
              return true;
            } catch (error) {
              console.warn(`Unable to remove persisted data for ${key}`, error);
              return false;
            }
          },
        };

  const isPlainObject = (value) =>
    Boolean(value) && typeof value === "object" && !Array.isArray(value);

  const sanitiseStoredName = (value, fallback) => {
    if (typeof value !== "string") {
      return fallback;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : fallback;
  };

  const normaliseStoredNames = (value) => ({
    X: sanitiseStoredName(value?.X, DEFAULT_NAMES.X),
    O: sanitiseStoredName(value?.O, DEFAULT_NAMES.O),
  });

  const readPersistedNames = () => {
    const stored = storage.readJson(NAMES_STORAGE_KEY, isPlainObject);
    if (!stored) {
      return null;
    }
    return normaliseStoredNames(stored);
  };

  const normaliseScoreValue = (value) => {
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      return Math.floor(value);
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length) {
        const parsed = Number(trimmed);
        if (Number.isFinite(parsed) && parsed >= 0) {
          return Math.floor(parsed);
        }
      }
    }
    return 0;
  };

  const normaliseScores = (value) => ({
    X: normaliseScoreValue(value?.X),
    O: normaliseScoreValue(value?.O),
  });

  const readPersistedScores = () => {
    const stored = storage.readJson(SCORES_STORAGE_KEY, isPlainObject);
    if (!stored) {
      return null;
    }
    return normaliseScores(stored);
  };

  const writePersistedScores = (value) => {
    const normalised = normaliseScores(value);
    storage.writeJson(SCORES_STORAGE_KEY, normalised);
    return normalised;
  };

  document.addEventListener("DOMContentLoaded", () => {
    const statusMessage = document.getElementById("statusMessage");
    const nameElements = {
      X: document.querySelector('[data-role="name"][data-player="X"]'),
      O: document.querySelector('[data-role="name"][data-player="O"]'),
    };
    const scoreElements = {
      X: document.querySelector('[data-role="score"][data-player="X"]'),
      O: document.querySelector('[data-role="score"][data-player="O"]'),
    };

    if (!statusMessage || !nameElements.X || !nameElements.O) {
      throw new Error("Unable to initialise status UI; required elements are missing.");
    }

    let playerNames = { ...DEFAULT_NAMES };
    let scores = { ...DEFAULT_SCORES };
    let currentPlayer = "X";
    let statusState = "turn"; // "turn" | "win" | "draw"

    const formatTurnMessage = (player) =>
      `${playerNames[player]} (${player}) to move`;
    const formatWinMessage = (player) =>
      `${playerNames[player]} (${player}) wins this round!`;

    const refreshStatus = () => {
      switch (statusState) {
        case "win":
          statusMessage.textContent = formatWinMessage(currentPlayer);
          break;
        case "draw":
          statusMessage.textContent = "It's a draw!";
          break;
        case "turn":
        default:
          statusMessage.textContent = formatTurnMessage(currentPlayer);
          break;
      }
    };

    const applyNames = (names) => {
      playerNames = { ...DEFAULT_NAMES, ...names };
      nameElements.X.textContent = playerNames.X;
      nameElements.O.textContent = playerNames.O;
      refreshStatus();
    };

    const updateScoreDisplay = () => {
      scoreElements.X.textContent = String(scores.X);
      scoreElements.O.textContent = String(scores.O);
    };

    const api = {
      setTurn(player) {
        currentPlayer = player;
        statusState = "turn";
        refreshStatus();
      },
      announceWin(player) {
        currentPlayer = player;
        statusState = "win";
        refreshStatus();
      },
      announceDraw() {
        statusState = "draw";
        refreshStatus();
      },
      incrementScore(player) {
        const updated = { ...scores, [player]: (scores[player] ?? 0) + 1 };
        scores = writePersistedScores(updated);
        updateScoreDisplay();
        return scores[player];
      },
      resetScores() {
        scores = writePersistedScores(DEFAULT_SCORES);
        updateScoreDisplay();
      },
      getScores() {
        return { ...scores };
      },
      setScores(nextScores) {
        scores = writePersistedScores({ ...scores, ...nextScores });
        updateScoreDisplay();
      },
      getNames() {
        return { ...playerNames };
      },
    };

    window.uiStatus = api;

    document.addEventListener("settings:players-updated", (event) => {
      const detail = event?.detail;
      if (!detail || !detail.names) {
        return;
      }
      applyNames(detail.names);
    });

    const persistedNames = readPersistedNames();
    applyNames(persistedNames ? persistedNames : DEFAULT_NAMES);

    const persistedScores = readPersistedScores();
    if (persistedScores) {
      scores = persistedScores;
    }
    updateScoreDisplay();
    refreshStatus();
  });
})();
