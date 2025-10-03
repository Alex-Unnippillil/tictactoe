'use strict';

export const DEFAULT_PLAYER_NAMES = Object.freeze({
  X: 'Player X',
  O: 'Player O'
});

export function sanitiseName(value, fallback = '') {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  const safeFallback = typeof fallback === 'string' ? fallback : '';
  return trimmed.length ? trimmed : safeFallback;
}

export function normaliseNames(names = {}, defaults = DEFAULT_PLAYER_NAMES) {
  const resolvedDefaults = {
    X: defaults?.X ?? DEFAULT_PLAYER_NAMES.X,
    O: defaults?.O ?? DEFAULT_PLAYER_NAMES.O
  };

  return {
    X: sanitiseName(names?.X ?? '', resolvedDefaults.X),
    O: sanitiseName(names?.O ?? '', resolvedDefaults.O)
  };
}
