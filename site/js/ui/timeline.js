(function () {
  const DEFAULT_NAMES = {
    X: "Player X",
    O: "Player O",
  };
  const BOARD_SIZE = 3;
  const KEYBOARD_SCROLL_STEP = 72;
  const PAGE_SCROLL_RATIO = 0.9;

  const createTimeFormatter = () => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      console.warn("Unable to create timeline time formatter", error);
      return null;
    }
  };

  const readPlayerNamesFromCore = () => {
    const core = window.coreState;
    if (core && typeof core.getPlayerNames === "function") {
      try {
        const names = core.getPlayerNames();
        if (names && typeof names === "object") {
          return names;
        }
      } catch (error) {
        console.warn("Unable to read player names for timeline", error);
      }
    }
    return null;
  };

  const otherPlayer = (player) => {
    if (player === "X") {
      return "O";
    }
    if (player === "O") {
      return "X";
    }
    return null;
  };

  document.addEventListener("DOMContentLoaded", () => {
    const timeline = document.querySelector("[data-timeline]");
    if (!timeline) {
      return;
    }

    const list = /** @type {HTMLOListElement | null} */ (
      timeline.querySelector("[data-timeline-list]")
    );
    const meta = timeline.querySelector("[data-timeline-meta]");
    const emptyMessage = timeline.querySelector("[data-timeline-empty]");

    if (!list) {
      return;
    }

    const reduceMotionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    const shouldReduceMotion = () => Boolean(reduceMotionQuery?.matches);

    let turnCounter = 0;
    let roundStartedAt = null;
    let lastMoveAt = null;
    let nextPlayer = null;
    let playerNames = { ...DEFAULT_NAMES };

    const timeFormatter = createTimeFormatter();

    const formatTimestamp = (date) => {
      if (!date) {
        return "";
      }
      if (timeFormatter) {
        try {
          return timeFormatter.format(date);
        } catch (error) {
          console.warn("Unable to format timeline timestamp", error);
        }
      }
      return date.toLocaleTimeString();
    };

    const formatCellPosition = (index) => {
      const row = Math.floor(index / BOARD_SIZE) + 1;
      const column = (index % BOARD_SIZE) + 1;
      return { row, column };
    };

    const scrollByAmount = (delta) => {
      if (typeof list.scrollBy === "function" && !shouldReduceMotion()) {
        list.scrollBy({ top: delta, behavior: "smooth" });
        return;
      }
      list.scrollTop += delta;
    };

    const scrollToPosition = (top) => {
      if (typeof list.scrollTo === "function" && !shouldReduceMotion()) {
        list.scrollTo({ top, behavior: "smooth" });
        return;
      }
      list.scrollTop = top;
    };

    const scrollListToEnd = () => {
      scrollToPosition(list.scrollHeight);
    };

    const setEmptyState = (isEmpty) => {
      if (emptyMessage) {
        emptyMessage.hidden = !isEmpty;
      }
      timeline.dataset.state = isEmpty ? "empty" : "active";
    };

    const updateMeta = () => {
      if (!meta) {
        return;
      }

      if (!roundStartedAt) {
        meta.textContent = "Waiting for the next round.";
        return;
      }

      const startTime = formatTimestamp(roundStartedAt);

      if (!turnCounter) {
        const opener =
          nextPlayer && (playerNames[nextPlayer] || `Player ${nextPlayer}`);
        meta.textContent = opener
          ? `Round started at ${startTime} — ${opener} to move.`
          : `Round started at ${startTime}.`;
        return;
      }

      const lastTime = formatTimestamp(lastMoveAt);
      if (nextPlayer) {
        const name = playerNames[nextPlayer] || `Player ${nextPlayer}`;
        meta.textContent = `Turn ${turnCounter} played at ${lastTime} — next: ${name}.`;
      } else {
        meta.textContent = `Round completed at ${lastTime} after ${turnCounter} turns.`;
      }
    };

    const refreshNameBadges = () => {
      list.querySelectorAll("[data-player-name]").forEach((element) => {
        const id = element.getAttribute("data-player-name");
        if (!id) {
          return;
        }
        element.textContent = playerNames[id] || `Player ${id}`;
      });
    };

    const applyPlayerNames = (names) => {
      if (!names || typeof names !== "object") {
        return;
      }
      playerNames = { ...playerNames, ...names };
      refreshNameBadges();
      updateMeta();
    };

    const buildMoveItem = (detail, turnNumber) => {
      const { player, index } = detail;
      if (!player || typeof index !== "number") {
        return null;
      }

      const timestamp = new Date();
      const { row, column } = formatCellPosition(index);

      const item = document.createElement("li");
      item.className = "timeline__item";
      item.dataset.player = player;
      item.dataset.turn = String(turnNumber);

      const card = document.createElement("article");
      card.className = "timeline__card";

      const avatar = document.createElement("span");
      avatar.className = "timeline__avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = player;

      const details = document.createElement("div");
      details.className = "timeline__details";

      const topRow = document.createElement("div");
      topRow.className = "timeline__row";

      const playerLabel = document.createElement("span");
      playerLabel.className = "timeline__player";
      playerLabel.dataset.playerName = player;
      playerLabel.textContent = playerNames[player] || `Player ${player}`;

      const timeElement = document.createElement("time");
      timeElement.className = "timeline__time";
      timeElement.dateTime = timestamp.toISOString();
      timeElement.textContent = formatTimestamp(timestamp);

      topRow.append(playerLabel, timeElement);

      const summary = document.createElement("p");
      summary.className = "timeline__summary";

      const turnBadge = document.createElement("span");
      turnBadge.className = "timeline__turn";
      turnBadge.textContent = `Turn ${turnNumber}`;

      const location = document.createElement("span");
      location.className = "timeline__location";
      location.textContent = `Row ${row} · Column ${column}`;

      summary.append(turnBadge, location);

      details.append(topRow, summary);
      card.append(avatar, details);
      item.append(card);

      return { item, timestamp };
    };

    const resetTimeline = (detail) => {
      list.innerHTML = "";
      list.scrollTop = 0;
      turnCounter = 0;
      roundStartedAt = new Date();
      lastMoveAt = null;
      nextPlayer = detail?.currentPlayer || null;
      setEmptyState(true);
      updateMeta();
    };

    const handleMovePlayed = (detail) => {
      if (!detail || typeof detail.index !== "number" || !detail.player) {
        return;
      }

      turnCounter += 1;
      const entry = buildMoveItem(detail, turnCounter);
      if (!entry) {
        turnCounter -= 1;
        return;
      }

      list.append(entry.item);
      lastMoveAt = entry.timestamp;
      nextPlayer = detail.isRoundOver ? null : otherPlayer(detail.player);
      setEmptyState(false);
      updateMeta();
      scrollListToEnd();
    };

    const handleKeyboardScroll = (event) => {
      const { key } = event;
      if (!key) {
        return;
      }

      const pageStep = Math.max(list.clientHeight * PAGE_SCROLL_RATIO, KEYBOARD_SCROLL_STEP * 2);

      switch (key) {
        case "ArrowDown":
          scrollByAmount(KEYBOARD_SCROLL_STEP);
          event.preventDefault();
          break;
        case "ArrowUp":
          scrollByAmount(-KEYBOARD_SCROLL_STEP);
          event.preventDefault();
          break;
        case "PageDown":
          scrollByAmount(pageStep);
          event.preventDefault();
          break;
        case "PageUp":
          scrollByAmount(-pageStep);
          event.preventDefault();
          break;
        case "Home":
          if (list.scrollTop > 0) {
            scrollToPosition(0);
            event.preventDefault();
          }
          break;
        case "End":
          if (list.scrollTop + list.clientHeight < list.scrollHeight) {
            scrollToPosition(list.scrollHeight);
            event.preventDefault();
          }
          break;
        default:
          break;
      }
    };

    list.addEventListener("keydown", handleKeyboardScroll);

    document.addEventListener("game:round-started", (event) => {
      resetTimeline(event?.detail || {});
    });

    document.addEventListener("game:move-played", (event) => {
      handleMovePlayed(event?.detail || {});
    });

    document.addEventListener("settings:players-updated", (event) => {
      applyPlayerNames(event?.detail?.names);
    });

    document.addEventListener("state:players-changed", (event) => {
      applyPlayerNames(event?.detail?.names);
    });

    document.addEventListener("history:players-changed", (event) => {
      const detail = event?.detail;
      if (!detail || detail.source === "history" || !detail.source) {
        applyPlayerNames(detail?.names);
      }
    });

    setEmptyState(true);
    updateMeta();

    const initialNames = readPlayerNamesFromCore();
    if (initialNames) {
      applyPlayerNames(initialNames);
    }
  });
})();
