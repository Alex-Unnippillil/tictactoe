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

  const listeners = new Map();
  let playerNames = { ...DEFAULT_NAMES };
  let playerAvatars = { ...DEFAULT_AVATARS };

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

  const normaliseAvatars = (nextAvatars, base = DEFAULT_AVATARS) => {
    const result = {
      X: base.X ? { ...base.X } : null,
      O: base.O ? { ...base.O } : null,
    };

    if (nextAvatars && typeof nextAvatars === "object") {
      if (Object.prototype.hasOwnProperty.call(nextAvatars, "X")) {
        result.X = sanitiseAvatar(nextAvatars.X);
      }
      if (Object.prototype.hasOwnProperty.call(nextAvatars, "O")) {
        result.O = sanitiseAvatar(nextAvatars.O);
      }
    }

    return result;
  };

  const cloneAvatar = (avatar) => (avatar ? { ...avatar } : null);

  const getAvatarSnapshot = () => ({
    X: cloneAvatar(playerAvatars.X),
    O: cloneAvatar(playerAvatars.O),
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

  const emitPlayersChanged = (source) => {
    emit("players-changed", {
      names: { ...playerNames },
      avatars: getAvatarSnapshot(),
      source,
    });
  };

  const setPlayerNames = (nextNames, options = {}) => {
    const { silent = false, source = "core" } = options;
    const normalised = normaliseNames(nextNames);
    const changed =
      normalised.X !== playerNames.X || normalised.O !== playerNames.O;

    playerNames = normalised;

    if (!silent && changed) {
      emitPlayersChanged(source);
    }

    return { ...playerNames };
  };

  const setPlayerAvatars = (nextAvatars, options = {}) => {
    const { silent = false, source = "core" } = options;
    const normalised = normaliseAvatars(nextAvatars, playerAvatars);
    const changed = !avatarsEqual(playerAvatars, normalised);

    playerAvatars = normalised;

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

  const api = {
    DEFAULT_NAMES: { ...DEFAULT_NAMES },
    DEFAULT_AVATARS: { ...DEFAULT_AVATARS },
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
    getPlayerAvatars() {
      return getAvatarSnapshot();
    },
    setPlayerAvatars(nextAvatars, options) {
      return setPlayerAvatars(nextAvatars, options);
    },
    hydratePlayerAvatars(nextAvatars, options = {}) {
      const { emitUpdate = true, source = "hydrate" } = options;
      return setPlayerAvatars(nextAvatars, {
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
