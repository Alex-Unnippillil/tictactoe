'use strict';

(function (global) {
  const BOARD_SIZE = 3;
  const LOG_PREFIX = '[game]';

  function createEmptyBoard() {
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(''));
  }

  function createInitialState() {
    return {
      board: createEmptyBoard(),
      currentPlayer: 'X',
      winner: null,
      moveCount: 0,
    };
  }

  function cloneState(value) {
    if (typeof global.structuredClone === 'function') {
      return global.structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const historyApi = global.GameHistory;

    if (!historyApi || typeof historyApi.createHistory !== 'function') {
      console.error(`${LOG_PREFIX} Unable to initialise history; GameHistory.createHistory is missing.`);
      return;
    }

    const history = historyApi.createHistory(createInitialState());
    let lastKnownState = history.getCurrent();

    const undoButton = document.querySelector('[data-action="undo"]');
    const redoButton = document.querySelector('[data-action="redo"]');

    function cloneForConsumers(state) {
      return cloneState(state);
    }

    function refreshControls() {
      if (undoButton) {
        undoButton.disabled = !history.canUndo();
        undoButton.setAttribute('aria-disabled', undoButton.disabled ? 'true' : 'false');
      }
      if (redoButton) {
        redoButton.disabled = !history.canRedo();
        redoButton.setAttribute('aria-disabled', redoButton.disabled ? 'true' : 'false');
      }
    }

    function notify(reason) {
      lastKnownState = history.getCurrent();
      const detailState = cloneForConsumers(lastKnownState);
      document.dispatchEvent(
        new CustomEvent('game:state-changed', {
          detail: {
            state: detailState,
            canUndo: history.canUndo(),
            canRedo: history.canRedo(),
            reason,
          },
        })
      );
      refreshControls();
      return detailState;
    }

    function handleUndoRequest(source) {
      const snapshot = history.undo();
      if (!snapshot) {
        return null;
      }
      return notify(source || 'undo');
    }

    function handleRedoRequest(source) {
      const snapshot = history.redo();
      if (!snapshot) {
        return null;
      }
      return notify(source || 'redo');
    }

    const controller = {
      getState() {
        return cloneForConsumers(lastKnownState);
      },
      recordState(state, options = {}) {
        if (options?.replace) {
          history.replaceCurrent(state);
        } else {
          history.push(state);
        }
        return notify(options?.reason || (options?.replace ? 'replace' : 'record'));
      },
      undo() {
        return handleUndoRequest('undo');
      },
      redo() {
        return handleRedoRequest('redo');
      },
      reset(nextState) {
        const targetState = nextState ? nextState : createInitialState();
        history.reset(targetState);
        return notify('reset');
      },
      canUndo() {
        return history.canUndo();
      },
      canRedo() {
        return history.canRedo();
      },
      getHistoryLength() {
        return history.getLength();
      },
    };

    function attachButtonHandlers() {
      if (undoButton) {
        undoButton.addEventListener('click', (event) => {
          event.preventDefault();
          handleUndoRequest('undo-button');
        });
      }
      if (redoButton) {
        redoButton.addEventListener('click', (event) => {
          event.preventDefault();
          handleRedoRequest('redo-button');
        });
      }
    }

    function attachEventHandlers() {
      document.addEventListener('game:undo-requested', (event) => {
        if (event) {
          event.preventDefault?.();
        }
        handleUndoRequest('undo-event');
      });

      document.addEventListener('game:redo-requested', (event) => {
        if (event) {
          event.preventDefault?.();
        }
        handleRedoRequest('redo-event');
      });
    }

    attachButtonHandlers();
    attachEventHandlers();
    refreshControls();

    global.GameController = controller;

    notify('init');
  });
})(typeof window !== 'undefined' ? window : globalThis);
