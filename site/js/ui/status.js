(function () {
  const DEFAULT_NAMES = {
    X: "Player X",
    O: "Player O",
  };
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

  const deriveInitialsFromName = (name, fallback) => {
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (!trimmed) {
      return fallback;
    }

    const words = trimmed.split(/\s+/u).filter(Boolean);
    if (!words.length) {
      return fallback;
    }

    const initials = [];
    for (let index = 0; index < words.length && initials.length < 2; index += 1) {
      const characters = Array.from(words[index]).filter((char) => /[\p{L}\p{N}]/u.test(char));
      if (characters[0]) {
        initials.push(characters[0]);
      }
    }

    if (!initials.length) {
      const characters = Array.from(words[0]).filter((char) => /[\p{L}\p{N}]/u.test(char));
      if (characters[0]) {
        initials.push(characters[0]);
      }
      if (characters.length > 1) {
        const [, second = ""] = characters;
        if (second) {
          initials.push(second);
        }
      }
    }

    const derived = sanitiseInitials(initials.join(""));
    if (derived) {
      return derived;
    }

    const fallbackInitials = sanitiseInitials(words[0]);
    return fallbackInitials || fallback;
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
    const next = {
      X: base.X ? { ...base.X } : null,
      O: base.O ? { ...base.O } : null,
    };

    if (avatars && typeof avatars === "object") {
      if (Object.prototype.hasOwnProperty.call(avatars, "X")) {
        next.X = sanitiseAvatar(avatars.X);
      }
      if (Object.prototype.hasOwnProperty.call(avatars, "O")) {
        next.O = sanitiseAvatar(avatars.O);
      }
    }

    return next;
  };

  const cloneAvatar = (avatar) => (avatar ? { ...avatar } : null);

  const toCssUrl = (value) => {
    const escaped = String(value).replace(/[\n\r\f"\\]/g, "\$&");
    return `url("${escaped}")`;
  };

  document.addEventListener("DOMContentLoaded", () => {
    const statusMessage = document.getElementById("statusMessage");
    const nameElements = {
      X: document.querySelector('[data-role="name"][data-player="X"]'),
      O: document.querySelector('[data-role="name"][data-player="O"]'),
    };
    const scoreElements = {
      X: document.querySelector('[data-role="score"][data-player="X"]'),
      O: document.querySelector('[data-role="score"][data-player="O"]'),
    };
    const avatarElements = {
      X: {
        root: document.querySelector('[data-role="avatar"][data-player="X"]'),
        fallback: document.querySelector('[data-role="avatar-fallback"][data-player="X"]'),
        image: document.querySelector('[data-role="avatar-image"][data-player="X"]'),
      },
      O: {
        root: document.querySelector('[data-role="avatar"][data-player="O"]'),
        fallback: document.querySelector('[data-role="avatar-fallback"][data-player="O"]'),
        image: document.querySelector('[data-role="avatar-image"][data-player="O"]'),
      },
    };
    const playerCards = {
      X: document.querySelector('.scoreboard__player[data-player="X"]'),
      O: document.querySelector('.scoreboard__player[data-player="O"]'),
    };

    if (
      !statusMessage ||
      !nameElements.X ||
      !nameElements.O ||
      !scoreElements.X ||
      !scoreElements.O ||
      !avatarElements.X.root ||
      !avatarElements.O.root ||
      !avatarElements.X.fallback ||
      !avatarElements.O.fallback ||
      !avatarElements.X.image ||
      !avatarElements.O.image ||
      !playerCards.X ||
      !playerCards.O
    ) {
      throw new Error("Unable to initialise status UI; required elements are missing.");
    }

    let playerNames = { ...DEFAULT_NAMES };
    let playerAvatars = { ...DEFAULT_AVATARS };
    let scores = { X: 0, O: 0 };
    let currentPlayer = "X";
    let statusState = "turn"; // "turn" | "win" | "draw"

    const formatTurnMessage = (player) =>
      `${playerNames[player]} (${player}) to move`;
    const formatWinMessage = (player) =>
      `${playerNames[player]} (${player}) wins this round!`;

    const applyVisualState = () => {
      statusMessage.dataset.state = statusState;
      if (statusState === "draw") {
        statusMessage.dataset.player = "none";
        return;
      }
      statusMessage.dataset.player = currentPlayer;
    };

    const refreshStatus = () => {
      switch (statusState) {
        case "win":
          statusMessage.textContent = formatWinMessage(currentPlayer);
          break;
        case "draw":
          statusMessage.textContent = "It's a draw!";
          break;
        case "turn":
        default:
          statusMessage.textContent = formatTurnMessage(currentPlayer);
          break;
      }
      applyVisualState();
    };

    const updateAvatarDisplay = () => {
      PLAYERS.forEach((player) => {
        const elements = avatarElements[player];
        if (!elements || !elements.root) {
          return;
        }

        const { root, fallback, image } = elements;
        const config = playerAvatars[player];
        let type = "initials";
        let fallbackText = deriveInitialsFromName(playerNames[player], player);

        root.style.removeProperty("--avatar-mask-image");
        root.style.removeProperty("--avatar-hue");
        root.style.removeProperty("--avatar-saturation");
        root.style.removeProperty("--avatar-lightness");

        if (image) {
          image.hidden = true;
        }

        if (config?.type === "image" && config.url && image) {
          type = "image";
          if (image.src !== config.url) {
            image.src = config.url;
          }
          image.hidden = false;
        }

        if (config?.type === "initials" && config.text) {
          fallbackText = config.text;
        }

        if (fallback) {
          fallback.textContent = fallbackText;
        }

        if (config?.type === "orb") {
          type = "orb";
          const hue = Number(config.hue);
          const saturation = Number(config.saturation);
          const lightness = Number(config.lightness);
          root.style.setProperty(
            "--avatar-hue",
            Number.isFinite(hue) ? String(hue) : String(ORB_DEFAULTS.hue)
          );
          root.style.setProperty(
            "--avatar-saturation",
            Number.isFinite(saturation) ? `${saturation}%` : `${ORB_DEFAULTS.saturation}%`
          );
          root.style.setProperty(
            "--avatar-lightness",
            Number.isFinite(lightness) ? `${lightness}%` : `${ORB_DEFAULTS.lightness}%`
          );
        }

        if (config?.type === "mask" && config.url) {
          type = "mask";
          root.style.setProperty("--avatar-mask-image", toCssUrl(config.url));
          const hue = Number(config.hue);
          root.style.setProperty(
            "--avatar-hue",
            Number.isFinite(hue) ? String(hue) : String(ORB_DEFAULTS.hue)
          );
        }

        root.dataset.avatarType = type;
      });
    };

    const applyNames = (names) => {
      playerNames = { ...DEFAULT_NAMES, ...names };
      nameElements.X.textContent = playerNames.X;
      nameElements.O.textContent = playerNames.O;
      refreshStatus();
      updateAvatarDisplay();
    };

    const applyAvatars = (avatars) => {
      playerAvatars = normaliseAvatars(avatars, playerAvatars);
      updateAvatarDisplay();
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
      getAvatars() {
        return {
          X: cloneAvatar(playerAvatars.X),
          O: cloneAvatar(playerAvatars.O),
        };
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
      if (!detail) {
        return;
      }
      if (detail.names) {
        applyNames(detail.names);
      }
      if (Object.prototype.hasOwnProperty.call(detail, "avatars")) {
        applyAvatars(detail.avatars);
      }
    });

    document.addEventListener("state:players-changed", (event) => {
      const detail = event?.detail;
      if (!detail) {
        return;
      }
      if (detail.names) {
        applyNames(detail.names);
      }
      if (Object.prototype.hasOwnProperty.call(detail, "avatars")) {
        applyAvatars(detail.avatars);
      }
    });

    document.addEventListener("history:players-changed", (event) => {
      const detail = event?.detail;
      if (!detail) {
        return;
      }
      if (detail.source && detail.source !== "history") {
        return;
      }
      if (detail.names) {
        applyNames(detail.names);
      }
      if (Object.prototype.hasOwnProperty.call(detail, "avatars")) {
        applyAvatars(detail.avatars);
      }
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

    if (core && typeof core.getPlayerAvatars === "function") {
      try {
        const avatars = core.getPlayerAvatars();
        applyAvatars(avatars);
      } catch (error) {
        console.warn("Unable to read player avatars from core state", error);
      }
    }
  });
})();
