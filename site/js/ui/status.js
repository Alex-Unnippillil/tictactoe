(function () {
  const DEFAULT_NAMES = {
    X: "Player X",
    O: "Player O",
  };

  document.addEventListener("DOMContentLoaded", () => {
    const statusMessage = document.getElementById("statusMessage");
    const statusText = statusMessage?.querySelector(".status__text");
    const nameElements = {
      X: document.querySelector('[data-role="name"][data-player="X"]'),
      O: document.querySelector('[data-role="name"][data-player="O"]'),
    };
    const scoreElements = {
      X: document.querySelector('[data-role="score"][data-player="X"]'),
      O: document.querySelector('[data-role="score"][data-player="O"]'),
    };
    const playerCards = {
      X: document.querySelector('.scoreboard__player[data-player="X"]'),
      O: document.querySelector('.scoreboard__player[data-player="O"]'),
    };

    if (
      !statusMessage ||
      !statusText ||
      !nameElements.X ||
      !nameElements.O ||
      !scoreElements.X ||
      !scoreElements.O ||
      !playerCards.X ||
      !playerCards.O
    ) {
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

    const BASE_TRANSITION_CLASS = "status--transition";
    const TRANSITION_VARIANTS = {
      turn: "status--transition--turn",
      win: "status--transition--win",
      draw: "status--transition--draw",
    };
    const ALL_TRANSITION_CLASSES = [
      BASE_TRANSITION_CLASS,
      ...Object.values(TRANSITION_VARIANTS),
    ];

    let transitionFallbackTimeout = null;
    let hasRenderedInitialStatus = false;

    const clearTransitionClasses = () => {
      if (transitionFallbackTimeout) {
        clearTimeout(transitionFallbackTimeout);
        transitionFallbackTimeout = null;
      }
      statusMessage.classList.remove(...ALL_TRANSITION_CLASSES);
    };

    const scheduleTransitionCleanup = () => {
      if (transitionFallbackTimeout) {
        clearTimeout(transitionFallbackTimeout);
      }
      transitionFallbackTimeout = window.setTimeout(() => {
        clearTransitionClasses();
      }, 800);
    };

    const triggerTransition = (state) => {
      clearTransitionClasses();
      // Force reflow so animations retrigger reliably across browsers.
      void statusMessage.offsetWidth;
      statusMessage.classList.add(BASE_TRANSITION_CLASS);
      const variantClass = TRANSITION_VARIANTS[state] || TRANSITION_VARIANTS.turn;
      statusMessage.classList.add(variantClass);
      scheduleTransitionCleanup();
    };

    const handleAnimationEnd = (event) => {
      if (event.target !== statusText) {
        return;
      }
      clearTransitionClasses();
    };

    statusMessage.addEventListener("animationend", handleAnimationEnd);
    statusMessage.addEventListener("animationcancel", handleAnimationEnd);

    const applyVisualState = () => {
      statusMessage.dataset.state = statusState;
      if (statusState === "draw") {
        statusMessage.dataset.player = "none";
        return;
      }
      statusMessage.dataset.player = currentPlayer;
    };

    const refreshStatus = () => {
      let nextMessage;
      switch (statusState) {
        case "win":
          nextMessage = formatWinMessage(currentPlayer);
          break;
        case "draw":
          nextMessage = "It's a draw!";
          break;
        case "turn":
        default:
          nextMessage = formatTurnMessage(currentPlayer);
          break;
      }

      const hasChanged = statusText.textContent !== nextMessage;
      statusText.textContent = nextMessage;
      applyVisualState();
      if (hasRenderedInitialStatus && hasChanged) {
        triggerTransition(statusState);
      }
      hasRenderedInitialStatus = true;
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

    const setActivePlayerCard = (player) => {
      (/** @type {("X"|"O")[]} */ (["X", "O"]))
        .filter((id) => playerCards[id])
        .forEach((id) => {
          playerCards[id].classList.toggle("scoreboard__player--active", id === player);
        });
    };

    const api = {
      setTurn(player) {
        currentPlayer = player;
        statusState = "turn";
        refreshStatus();
        setActivePlayerCard(player);
      },
      announceWin(player) {
        currentPlayer = player;
        statusState = "win";
        refreshStatus();
        setActivePlayerCard(player);
      },
      announceDraw() {
        statusState = "draw";
        refreshStatus();
        setActivePlayerCard(null);
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
    setActivePlayerCard(currentPlayer);

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
