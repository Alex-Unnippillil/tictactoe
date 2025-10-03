'use strict';

import { DEFAULT_PLAYER_NAMES, normaliseNames } from '../core/players.js';

const STATUS_STATES = {
  TURN: 'turn',
  WIN: 'win',
  DRAW: 'draw'
};

function resolveElements(doc, provided) {
  if (provided) {
    return provided;
  }
  return {
    X: doc.querySelector('[data-role="name"][data-player="X"]'),
    O: doc.querySelector('[data-role="name"][data-player="O"]')
  };
}

function resolveScoreElements(doc, provided) {
  if (provided) {
    return provided;
  }
  return {
    X: doc.querySelector('[data-role="score"][data-player="X"]'),
    O: doc.querySelector('[data-role="score"][data-player="O"]')
  };
}

export function createStatusController(options = {}) {
  const {
    document: doc = document,
    statusElement = doc?.getElementById?.('statusMessage') ?? null,
    nameElements: providedNameElements,
    scoreElements: providedScoreElements,
    initialNames = DEFAULT_PLAYER_NAMES
  } = options;

  if (!doc) {
    throw new Error('A document reference is required to initialise the status UI.');
  }

  const nameElements = resolveElements(doc, providedNameElements);
  const scoreElements = resolveScoreElements(doc, providedScoreElements);

  if (!statusElement || !nameElements?.X || !nameElements?.O) {
    throw new Error('Unable to initialise status UI; required elements are missing.');
  }

  let playerNames = normaliseNames(initialNames, DEFAULT_PLAYER_NAMES);
  let scores = { X: 0, O: 0 };
  let currentPlayer = 'X';
  let statusState = STATUS_STATES.TURN;

  const formatTurnMessage = (player) => `${playerNames[player]} (${player}) to move`;
  const formatWinMessage = (player) => `${playerNames[player]} (${player}) wins this round!`;

  const refreshStatus = () => {
    switch (statusState) {
      case STATUS_STATES.WIN:
        statusElement.textContent = formatWinMessage(currentPlayer);
        break;
      case STATUS_STATES.DRAW:
        statusElement.textContent = "It's a draw!";
        break;
      case STATUS_STATES.TURN:
      default:
        statusElement.textContent = formatTurnMessage(currentPlayer);
        break;
    }
  };

  const updateScoreDisplay = () => {
    if (scoreElements?.X) {
      scoreElements.X.textContent = String(scores.X);
    }
    if (scoreElements?.O) {
      scoreElements.O.textContent = String(scores.O);
    }
  };

  const applyNames = (names) => {
    playerNames = normaliseNames(names, DEFAULT_PLAYER_NAMES);
    if (nameElements?.X) {
      nameElements.X.textContent = playerNames.X;
    }
    if (nameElements?.O) {
      nameElements.O.textContent = playerNames.O;
    }
    refreshStatus();
    return { ...playerNames };
  };

  const setTurn = (player) => {
    currentPlayer = player;
    statusState = STATUS_STATES.TURN;
    refreshStatus();
  };

  const announceWin = (player) => {
    currentPlayer = player;
    statusState = STATUS_STATES.WIN;
    refreshStatus();
  };

  const announceDraw = () => {
    statusState = STATUS_STATES.DRAW;
    refreshStatus();
  };

  const incrementScore = (player) => {
    scores[player] += 1;
    updateScoreDisplay();
    return scores[player];
  };

  const resetScores = () => {
    scores = { X: 0, O: 0 };
    updateScoreDisplay();
  };

  const getScores = () => ({ ...scores });

  const setScores = (nextScores) => {
    scores = { ...scores, ...nextScores };
    updateScoreDisplay();
  };

  const getNames = () => ({ ...playerNames });

  // Initialise UI state.
  applyNames(playerNames);
  updateScoreDisplay();

  return {
    announceDraw,
    announceWin,
    applyNames,
    getNames,
    getScores,
    incrementScore,
    resetScores,
    setScores,
    setTurn
  };
}
