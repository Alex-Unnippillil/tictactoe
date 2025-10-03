'use strict';

(function (global) {
  const DEFAULT_OPTIONS = {
    clone: null,
    capacity: Infinity,
  };

  const cloneUsingStructuredClone =
    typeof global.structuredClone === 'function'
      ? (value) => global.structuredClone(value)
      : null;

  let cloneUsingV8 = null;
  if (!cloneUsingStructuredClone && typeof module !== 'undefined' && module.exports) {
    try {
      const { serialize, deserialize } = require('node:v8');
      cloneUsingV8 = (value) => deserialize(serialize(value));
    } catch (error) {
      // Ignore – fall back to JSON cloning below.
    }
  }

  function defaultClone(value) {
    if (cloneUsingStructuredClone) {
      return cloneUsingStructuredClone(value);
    }
    if (cloneUsingV8) {
      return cloneUsingV8(value);
    }
    return JSON.parse(JSON.stringify(value));
  }

  function normaliseOptions(options) {
    const merged = { ...DEFAULT_OPTIONS, ...(options || {}) };

    if (merged.clone == null) {
      merged.clone = defaultClone;
    }

    if (typeof merged.clone !== 'function') {
      throw new TypeError('History clone option must be a function.');
    }

    if (!Number.isFinite(merged.capacity) || merged.capacity <= 0) {
      merged.capacity = Infinity;
    }

    return merged;
  }

  function ensureInitialState(state) {
    if (typeof state === 'undefined') {
      throw new Error('createHistory requires an initial state.');
    }
  }

  function createHistory(initialState, options) {
    ensureInitialState(initialState);

    const settings = normaliseOptions(options);
    const { clone } = settings;
    let capacity = settings.capacity;

    let baseline = clone(initialState);
    let past = [clone(initialState)];
    let future = [];

    function trimPast() {
      if (!Number.isFinite(capacity)) {
        return;
      }
      while (past.length > capacity) {
        past.shift();
      }
    }

    function getCurrentSnapshot() {
      return past[past.length - 1];
    }

    function getCurrent() {
      return clone(getCurrentSnapshot());
    }

    function push(state) {
      const snapshot = clone(state);
      past.push(snapshot);
      future = [];
      trimPast();
      return getCurrent();
    }

    function canUndo() {
      return past.length > 1;
    }

    function canRedo() {
      return future.length > 0;
    }

    function undo() {
      if (!canUndo()) {
        return null;
      }
      const current = past.pop();
      future.push(current);
      return getCurrent();
    }

    function redo() {
      if (!canRedo()) {
        return null;
      }
      const next = future.pop();
      past.push(next);
      return clone(next);
    }

    function reset(state) {
      baseline = clone(state);
      past = [clone(state)];
      future = [];
      return getCurrent();
    }

    function replaceCurrent(state) {
      past[past.length - 1] = clone(state);
      future = [];
      return getCurrent();
    }

    function clear() {
      past = [clone(baseline)];
      future = [];
      return getCurrent();
    }

    function getLength() {
      return past.length;
    }

    return {
      push,
      undo,
      redo,
      reset,
      replaceCurrent,
      clear,
      canUndo,
      canRedo,
      getCurrent,
      getLength,
      _debug: {
        past: () => past.map((entry) => clone(entry)),
        future: () => future.map((entry) => clone(entry)),
      },
    };
  }

  const api = {
    createHistory,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.GameHistory = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
