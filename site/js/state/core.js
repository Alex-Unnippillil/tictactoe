(function () {
  const DEFAULT_NAMES = {
    X: "Player X",
    O: "Player O",
  };
  const NAME_PATTERN =
    window.coreState?.NAME_PATTERN ??
    /^[\p{L}\p{N}](?:[\p{L}\p{N}\s'.-]{0,23})$/u;

  const listeners = new Map();
  let playerNames = { ...DEFAULT_NAMES };

  const sanitiseName = (value, fallback) => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (!trimmed) {
      return fallback;
    }
    return NAME_PATTERN.test(trimmed) ? trimmed : fallback;
  };

  const normaliseNames = (nextNames) => ({
    X: sanitiseName(nextNames?.X ?? "", DEFAULT_NAMES.X),
    O: sanitiseName(nextNames?.O ?? "", DEFAULT_NAMES.O),
  });

  const emit = (event, detail) => {
    const handlers = listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(detail);
        } catch (error) {
          console.error("coreState listener failed", error);
        }
      });
    }

    if (typeof document !== "undefined" && typeof CustomEvent === "function") {
      document.dispatchEvent(
        new CustomEvent(`state:${event}`, {
          detail,
        })
      );
    }
  };

  const setPlayerNames = (nextNames, options = {}) => {
    const { silent = false, source = "core" } = options;
    const normalised = normaliseNames(nextNames);
    const changed =
      normalised.X !== playerNames.X || normalised.O !== playerNames.O;

    playerNames = normalised;

    if (!silent && changed) {
      emit("players-changed", {
        names: { ...playerNames },
        source,
      });
    }

    return { ...playerNames };
  };

  const subscribe = (event, handler) => {
    if (typeof handler !== "function") {
      return () => {};
    }

    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }

    const handlers = listeners.get(event);
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
      if (!handlers.size) {
        listeners.delete(event);
      }
    };
  };

  const api = {
    DEFAULT_NAMES: { ...DEFAULT_NAMES },
    NAME_PATTERN,
    getPlayerNames() {
      return { ...playerNames };
    },
    setPlayerNames(nextNames, options) {
      return setPlayerNames(nextNames, options);
    },
    hydratePlayerNames(nextNames, options = {}) {
      const { emitUpdate = true, source = "hydrate" } = options;
      return setPlayerNames(nextNames, {
        silent: !emitUpdate,
        source,
      });
    },
    subscribe(event, handler) {
      return subscribe(event, handler);
    },
  };

  window.coreState = api;

  if (typeof document !== "undefined" && typeof CustomEvent === "function") {
    document.dispatchEvent(
      new CustomEvent("core:ready", {
        detail: { state: api },
      })
    );
  }
})();
