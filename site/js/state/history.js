(function () {
  const DEFAULT_NAMES = {
    X: "Player X",
    O: "Player O",
  };
  const NAME_PATTERN =
    window.coreState?.NAME_PATTERN ??
    /^[\p{L}\p{N}](?:[\p{L}\p{N}\s'.-]{0,23})$/u;

  let coreSubscription = null;
  const listeners = new Map();

  const snapshot = {
    players: { ...DEFAULT_NAMES },
  };

  const sanitiseName = (value, fallback) => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (!trimmed) {
      return fallback;
    }
    return NAME_PATTERN.test(trimmed) ? trimmed : fallback;
  };

  const normaliseNames = (names) => ({
    X: sanitiseName(names?.X ?? "", DEFAULT_NAMES.X),
    O: sanitiseName(names?.O ?? "", DEFAULT_NAMES.O),
  });

  const emit = (event, detail) => {
    const handlers = listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(detail);
        } catch (error) {
          console.error("history listener failed", error);
        }
      });
    }

    if (typeof document !== "undefined" && typeof CustomEvent === "function") {
      document.dispatchEvent(
        new CustomEvent(`history:${event}`, {
          detail,
        })
      );
    }
  };

  const applyPlayerNames = (names, options = {}) => {
    const { silent = false, source = "history" } = options;
    const normalised = normaliseNames(names);
    const changed =
      normalised.X !== snapshot.players.X || normalised.O !== snapshot.players.O;

    snapshot.players = normalised;

    if (!silent && changed) {
      emit("players-changed", {
        names: { ...snapshot.players },
        source,
      });
    }

    return { ...snapshot.players };
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

  const connectToCoreState = () => {
    if (coreSubscription || typeof window === "undefined") {
      return;
    }

    const core = window.coreState;
    if (!core) {
      return;
    }

    try {
      applyPlayerNames(core.getPlayerNames?.(), {
        silent: true,
        source: "core",
      });
    } catch (error) {
      console.warn("Unable to synchronise player names from core state", error);
    }

    if (typeof core.subscribe === "function") {
      coreSubscription = core.subscribe("players-changed", (detail) => {
        if (!detail || !detail.names) {
          return;
        }
        applyPlayerNames(detail.names, {
          silent: false,
          source: detail.source ?? "core",
        });
      });
    }
  };

  const api = {
    getPlayers() {
      return { ...snapshot.players };
    },
    setPlayerNames(names, options) {
      return applyPlayerNames(names, options);
    },
    getSharePayload(additional = {}) {
      return {
        ...additional,
        players: { ...snapshot.players },
      };
    },
    getSnapshot() {
      return {
        players: { ...snapshot.players },
      };
    },
    subscribe(event, handler) {
      return subscribe(event, handler);
    },
    disconnect() {
      if (typeof coreSubscription === "function") {
        coreSubscription();
      }
      coreSubscription = null;
    },
  };

  window.gameHistory = api;

  if (window.coreState) {
    connectToCoreState();
  } else if (typeof document !== "undefined") {
    document.addEventListener("core:ready", connectToCoreState, {
      once: true,
    });
  }

  if (typeof document !== "undefined") {
    document.addEventListener("state:players-changed", (event) => {
      const detail = event?.detail;
      if (!detail || !detail.names) {
        return;
      }

      applyPlayerNames(detail.names, {
        silent: true,
        source: detail.source ?? "core",
      });
    });
  }
})();
