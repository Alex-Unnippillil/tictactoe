(function () {
  const DEFAULT_NAMES = {
    X: "Player X",
    O: "Player O",
  };
  const MODE_LABELS = {
    human: "Human vs Human",
    easy: "Human vs Computer (Easy)",
    medium: "Human vs Computer (Medium)",
    hard: "Human vs Computer (Hard)",
  };
  const DEFAULT_MODE = "human";
  const MODE_OPTIONS = new Set(Object.keys(MODE_LABELS));

  const normaliseMode = (value) =>
    MODE_OPTIONS.has(value) ? value : DEFAULT_MODE;

  const getModeLabel = (mode) => MODE_LABELS[mode] ?? MODE_LABELS[DEFAULT_MODE];

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
    const modeLabelElement = document.getElementById("modeLabel");
    const scoreboardSection = document.getElementById("scoreboard");
    const scoreboardModeElement = document.getElementById("scoreboardMode");

    if (!statusMessage || !nameElements.X || !nameElements.O) {
      throw new Error("Unable to initialise status UI; required elements are missing.");
    }

    let playerNames = { ...DEFAULT_NAMES };
    let scores = { X: 0, O: 0 };
    let currentPlayer = "X";
    let statusState = "turn"; // "turn" | "win" | "draw"
    let currentMode = DEFAULT_MODE;

    const formatTurnMessage = (player) =>
      `${playerNames[player]} (${player}) to move`;
    const formatWinMessage = (player) =>
      `${playerNames[player]} (${player}) wins this round!`;

    const refreshModeLabels = () => {
      const label = getModeLabel(currentMode);
      if (modeLabelElement) {
        modeLabelElement.textContent = label;
      }
      if (scoreboardModeElement) {
        scoreboardModeElement.textContent = label;
      }
      if (scoreboardSection) {
        scoreboardSection.setAttribute(
          "aria-label",
          `Player scoreboard — ${label}`
        );
      }
    };

    const refreshStatus = () => {
      const modeLabel = getModeLabel(currentMode);
      let message = "";
      switch (statusState) {
        case "win":
          message = formatWinMessage(currentPlayer);
          break;
        case "draw":
          message = "It's a draw!";
          break;
        case "turn":
        default:
          message = formatTurnMessage(currentPlayer);
          break;
      }
      statusMessage.textContent = `${modeLabel} — ${message}`;
    };

    const applyNames = (names) => {
      playerNames = { ...DEFAULT_NAMES, ...names };
      nameElements.X.textContent = playerNames.X;
      nameElements.O.textContent = playerNames.O;
      refreshStatus();
    };

    const applyMode = (mode) => {
      currentMode = normaliseMode(mode);
      refreshModeLabels();
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
        scores[player] += 1;
        updateScoreDisplay();
        return scores[player];
      },
      resetScores() {
        scores = { X: 0, O: 0 };
        updateScoreDisplay();
      },
      getScores() {
        return { ...scores };
      },
      setScores(nextScores) {
        scores = { ...scores, ...nextScores };
        updateScoreDisplay();
      },
      getNames() {
        return { ...playerNames };
      },
      setMode(mode) {
        applyMode(mode);
      },
      getMode() {
        return currentMode;
      },
    };

    window.uiStatus = api;

    document.addEventListener("settings:players-updated", (event) => {
      const detail = event?.detail;
      if (!detail) {
        return;
      }
      if (detail.names) {
        applyNames(detail.names);
      }
      if (detail.mode) {
        applyMode(detail.mode);
      }
    });

    applyNames(DEFAULT_NAMES);
    applyMode(DEFAULT_MODE);
    updateScoreDisplay();
    refreshStatus();
  });
})();
