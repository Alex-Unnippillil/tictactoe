(function () {
  const STORAGE_KEY = 'tictactoe-scoreboard';
  let scores = { xWins: 0, oWins: 0, draws: 0 };
  let elements = { xWins: null, oWins: null, draws: null, resetButton: null };
  let resetHandler = null;

  function loadScores() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return { ...scores };
      }
      const parsed = JSON.parse(saved);
      return {
        xWins: Number.isFinite(parsed.xWins) ? parsed.xWins : 0,
        oWins: Number.isFinite(parsed.oWins) ? parsed.oWins : 0,
        draws: Number.isFinite(parsed.draws) ? parsed.draws : 0
      };
    } catch (error) {
      console.warn('Unable to read scoreboard from localStorage:', error);
      return { ...scores };
    }
  }

  function persistScores() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch (error) {
      console.warn('Unable to persist scoreboard to localStorage:', error);
    }
  }

  function refreshUI() {
    if (elements.xWins) {
      elements.xWins.textContent = scores.xWins;
    }
    if (elements.oWins) {
      elements.oWins.textContent = scores.oWins;
    }
    if (elements.draws) {
      elements.draws.textContent = scores.draws;
    }
  }

  function bindResetHandler() {
    if (!elements.resetButton) {
      return;
    }

    if (resetHandler) {
      elements.resetButton.removeEventListener('click', resetHandler);
    }

    resetHandler = function () {
      scores = { xWins: 0, oWins: 0, draws: 0 };
      persistScores();
      refreshUI();
    };

    elements.resetButton.addEventListener('click', resetHandler);
  }

  function init(config) {
    config = config || {};

    elements = {
      xWins: config.xWinsElement || null,
      oWins: config.oWinsElement || null,
      draws: config.drawsElement || null,
      resetButton: config.resetButton || null
    };

    scores = loadScores();
    refreshUI();
    bindResetHandler();

    return api;
  }

  function recordWin(player) {
    if (player === 'X') {
      scores.xWins += 1;
    } else if (player === 'O') {
      scores.oWins += 1;
    } else {
      return;
    }

    persistScores();
    refreshUI();
  }

  function recordDraw() {
    scores.draws += 1;
    persistScores();
    refreshUI();
  }

  function getScores() {
    return { ...scores };
  }

  const api = {
    init,
    recordWin,
    recordDraw,
    getScores
  };

  window.Scoreboard = api;
})();
