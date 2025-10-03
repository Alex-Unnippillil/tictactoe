(function () {
  const DEFAULT_NAMES = {
    X: "Player X",
    O: "Player O",
  };
  const NAME_PATTERN =
    window.coreState?.NAME_PATTERN ??
    /^[\p{L}\p{N}](?:[\p{L}\p{N}\s'.-]{0,23})$/u;
  const DEFAULT_AVATARS = {
    X: null,
    O: null,
  };
  const ORB_DEFAULTS = {
    hue: 220,
    saturation: 72,
    lightness: 62,
  };
  /** @type {("X"|"O")[]} */
  const PLAYERS = ["X", "O"];

  let coreSubscription = null;
  const listeners = new Map();

  const snapshot = {
    players: { ...DEFAULT_NAMES },
    avatars: { ...DEFAULT_AVATARS },
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

  const clampNumber = (value, min, max, fallback) => {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    if (number < min) {
      return min;
    }
    if (number > max) {
      return max;
    }
    return number;
  };

  const sanitiseInitials = (value) => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (!trimmed) {
      return "";
    }
    const characters = trimmed.match(/[\p{L}\p{N}]/gu);
    if (!characters || !characters.length) {
      return "";
    }
    return characters.slice(0, 3).join("").toUpperCase();
  };

  const isSafeImageSource = (value) => {
    if (typeof value !== "string") {
      return false;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return false;
    }
    if (/^data:image\//i.test(trimmed)) {
      return true;
    }
    try {
      const base =
        typeof window !== "undefined" && window.location ? window.location.href : "https://example.invalid/";
      const url = new URL(trimmed, base);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_error) {
      return false;
    }
  };

  const sanitiseAvatar = (value) => {
    if (value === null || typeof value === "undefined") {
      return null;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) {
        return null;
      }
      return isSafeImageSource(trimmed) ? { type: "image", url: trimmed } : null;
    }

    if (typeof value !== "object") {
      return null;
    }

    const rawType = typeof value.type === "string" ? value.type.toLowerCase() : "";
    const type = rawType || (value.url || value.src ? "image" : "");

    if (type === "image") {
      const url = String(value.url ?? value.src ?? "").trim();
      if (!url || !isSafeImageSource(url)) {
        return null;
      }
      return { type: "image", url };
    }

    if (type === "initials") {
      const text = sanitiseInitials(value.text ?? value.value ?? "");
      if (!text) {
        return null;
      }
      return { type: "initials", text };
    }

    if (type === "orb" || type === "gradient") {
      const hue = clampNumber(value.hue ?? value.tint ?? ORB_DEFAULTS.hue, 0, 360, ORB_DEFAULTS.hue);
      const saturation = clampNumber(
        value.saturation ?? value.sat ?? ORB_DEFAULTS.saturation,
        10,
        100,
        ORB_DEFAULTS.saturation
      );
      const lightness = clampNumber(
        value.lightness ?? value.light ?? ORB_DEFAULTS.lightness,
        10,
        90,
        ORB_DEFAULTS.lightness
      );
      return {
        type: "orb",
        hue,
        saturation,
        lightness,
      };
    }

    if (type === "mask" || type === "svg") {
      const url = String(value.url ?? value.src ?? "").trim();
      if (!url || !isSafeImageSource(url)) {
        return null;
      }
      const hue = clampNumber(value.hue ?? value.tint ?? ORB_DEFAULTS.hue, 0, 360, ORB_DEFAULTS.hue);
      return {
        type: "mask",
        url,
        hue,
      };
    }

    return null;
  };

  const normaliseAvatars = (avatars, base = DEFAULT_AVATARS) => {
    const result = {
      X: base.X ? { ...base.X } : null,
      O: base.O ? { ...base.O } : null,
    };

    if (avatars && typeof avatars === "object") {
      if (Object.prototype.hasOwnProperty.call(avatars, "X")) {
        result.X = sanitiseAvatar(avatars.X);
      }
      if (Object.prototype.hasOwnProperty.call(avatars, "O")) {
        result.O = sanitiseAvatar(avatars.O);
      }
    }

    return result;
  };

  const cloneAvatar = (avatar) => (avatar ? { ...avatar } : null);

  const getAvatarSnapshot = () => ({
    X: cloneAvatar(snapshot.avatars.X),
    O: cloneAvatar(snapshot.avatars.O),
  });

  const avatarsEqual = (left, right) =>
    PLAYERS.every((player) => {
      const current = left[player];
      const next = right[player];
      if (!current && !next) {
        return true;
      }
      if (!current || !next) {
        return false;
      }
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(next);
      if (currentKeys.length !== nextKeys.length) {
        return false;
      }
      return currentKeys.every((key) => current[key] === next[key]);
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

  const emitPlayersChanged = (source) => {
    emit("players-changed", {
      names: { ...snapshot.players },
      avatars: getAvatarSnapshot(),
      source,
    });
  };

  const applyPlayerNames = (names, options = {}) => {
    const { silent = false, source = "history" } = options;
    const normalised = normaliseNames(names);
    const changed =
      normalised.X !== snapshot.players.X || normalised.O !== snapshot.players.O;

    snapshot.players = normalised;

    if (!silent && changed) {
      emitPlayersChanged(source);
    }

    return { ...snapshot.players };
  };

  const applyPlayerAvatars = (avatars, options = {}) => {
    const { silent = false, source = "history" } = options;
    const normalised = normaliseAvatars(avatars, snapshot.avatars);
    const changed = !avatarsEqual(snapshot.avatars, normalised);

    snapshot.avatars = normalised;

    if (!silent && changed) {
      emitPlayersChanged(source);
    }

    return getAvatarSnapshot();
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

    try {
      applyPlayerAvatars(core.getPlayerAvatars?.(), {
        silent: true,
        source: "core",
      });
    } catch (error) {
      console.warn("Unable to synchronise player avatars from core state", error);
    }

    if (typeof core.subscribe === "function") {
      coreSubscription = core.subscribe("players-changed", (detail) => {
        if (!detail) {
          return;
        }
        if (detail.names) {
          applyPlayerNames(detail.names, {
            silent: false,
            source: detail.source ?? "core",
          });
        }
        if (Object.prototype.hasOwnProperty.call(detail, "avatars")) {
          applyPlayerAvatars(detail.avatars, {
            silent: false,
            source: detail.source ?? "core",
          });
        }
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
    getPlayerAvatars() {
      return getAvatarSnapshot();
    },
    setPlayerAvatars(avatars, options) {
      return applyPlayerAvatars(avatars, options);
    },
    getSharePayload(additional = {}) {
      return {
        ...additional,
        players: { ...snapshot.players },
        avatars: getAvatarSnapshot(),
      };
    },
    getSnapshot() {
      return {
        players: { ...snapshot.players },
        avatars: getAvatarSnapshot(),
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
      if (!detail) {
        return;
      }

      if (detail.names) {
        applyPlayerNames(detail.names, {
          silent: true,
          source: detail.source ?? "core",
        });
      }

      if (Object.prototype.hasOwnProperty.call(detail, "avatars")) {
        applyPlayerAvatars(detail.avatars, {
          silent: true,
          source: detail.source ?? "core",
        });
      }
    });
  }
})();
