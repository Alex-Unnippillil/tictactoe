(function () {
  const DEFAULT_NAMES = {
    X: "Player X",
    O: "Player O",
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
    let scores = { X: 0, O: 0 };
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
    };

    window.uiStatus = api;

    const loadPwaInstallModule = () => {
      const existingScript = document.querySelector(
        'script[data-module="pwa-install"]'
      );
      if (existingScript) {
        return;
      }

      const script = document.createElement("script");
      script.src = "js/pwa/install.js";
      script.async = true;
      script.dataset.module = "pwa-install";
      document.head.appendChild(script);
    };

    loadPwaInstallModule();

    document.addEventListener("settings:players-updated", (event) => {
      const detail = event?.detail;
      if (!detail || !detail.names) {
        return;
      }
      applyNames(detail.names);
    });

    document.addEventListener("state:players-changed", (event) => {
      const detail = event?.detail;
      if (!detail || !detail.names) {
        return;
      }
      applyNames(detail.names);
    });

    document.addEventListener("history:players-changed", (event) => {
      const detail = event?.detail;
      if (!detail || !detail.names) {
        return;
      }
      if (detail.source && detail.source !== "history") {
        return;
      }
      applyNames(detail.names);
    });

    applyNames(DEFAULT_NAMES);
    updateScoreDisplay();
    refreshStatus();

    const core = window.coreState;
    if (core && typeof core.getPlayerNames === "function") {
      try {
        const names = core.getPlayerNames();
        if (names) {
          applyNames(names);
        }
      } catch (error) {
        console.warn("Unable to read player names from core state", error);
      }
    }
  });
})();
