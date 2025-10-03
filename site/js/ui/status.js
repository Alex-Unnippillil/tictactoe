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
    let temporaryMessage = null;

    const formatTurnMessage = (player) =>
      `${playerNames[player]} (${player}) to move`;
    const formatWinMessage = (player) =>
      `${playerNames[player]} (${player}) wins this round!`;

    const refreshStatus = () => {
      if (temporaryMessage) {
        statusMessage.textContent = temporaryMessage;
        return;
      }

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

    const clearTemporaryMessage = () => {
      if (!temporaryMessage) {
        return;
      }
      temporaryMessage = null;
      refreshStatus();
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
        clearTemporaryMessage();
        refreshStatus();
      },
      announceWin(player) {
        currentPlayer = player;
        statusState = "win";
        clearTemporaryMessage();
        refreshStatus();
      },
      announceDraw() {
        statusState = "draw";
        clearTemporaryMessage();
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
      showThinking() {
        temporaryMessage = "AI is thinking…";
        statusMessage.textContent = temporaryMessage;
      },
      clearTemporaryMessage,
    };

    window.uiStatus = api;

    document.addEventListener("settings:players-updated", (event) => {
      const detail = event?.detail;
      if (!detail || !detail.names) {
        return;
      }
      applyNames(detail.names);
    });

    applyNames(DEFAULT_NAMES);
    updateScoreDisplay();
    refreshStatus();
  });
})();
