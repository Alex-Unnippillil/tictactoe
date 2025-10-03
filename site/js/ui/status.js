(function () {
  const DEFAULT_NAMES = {
    X: "Player X",
    O: "Player O",
  };
  const FALLBACK_NAME_PATTERN =
    /^[\p{L}\p{N}](?:[\p{L}\p{N}\s'.-]{0,23})$/u;
  const FALLBACK_INVALID_MESSAGE =
    "Use letters, numbers, spaces, apostrophes, periods or hyphens only.";

  const fallbackSanitise = (value, fallback, pattern = FALLBACK_NAME_PATTERN) => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (!trimmed) {
      return fallback;
    }
    return pattern.test(trimmed) ? trimmed : fallback;
  };

  const createFallbackNormaliser = (pattern, defaults) => (names = {}) => ({
    X: fallbackSanitise(names?.X ?? "", defaults.X, pattern),
    O: fallbackSanitise(names?.O ?? "", defaults.O, pattern),
  });

  const getNameUtils = () => {
    const global =
      typeof window !== "undefined" ? window.playerNameValidation : undefined;
    const defaults = {
      ...DEFAULT_NAMES,
      ...(global && typeof global.DEFAULT_NAMES === "object"
        ? global.DEFAULT_NAMES
        : {}),
    };
    const pattern =
      (global && global.NAME_PATTERN instanceof RegExp
        ? global.NAME_PATTERN
        : global?.NAME_PATTERN) || FALLBACK_NAME_PATTERN;
    const isNameValid =
      global && typeof global.isNameValid === "function"
        ? global.isNameValid
        : (value) => pattern.test(value);
    const sanitiseName =
      global && typeof global.sanitiseName === "function"
        ? global.sanitiseName
        : (value, fallback) => fallbackSanitise(value, fallback, pattern);
    const normaliseNames =
      global && typeof global.normaliseNames === "function"
        ? global.normaliseNames
        : createFallbackNormaliser(pattern, defaults);

    return {
      defaults,
      pattern,
      isNameValid,
      sanitiseName,
      normaliseNames,
      invalidMessage:
        global && typeof global.INVALID_MESSAGE === "string"
          ? global.INVALID_MESSAGE
          : FALLBACK_INVALID_MESSAGE,
      applyAndPersistNames:
        global && typeof global.applyAndPersistNames === "function"
          ? global.applyAndPersistNames
          : null,
    };
  };

  document.addEventListener("DOMContentLoaded", () => {
    const statusMessage = document.getElementById("statusMessage");
    const nameButtons = {
      X: document.querySelector('[data-role="name"][data-player="X"]'),
      O: document.querySelector('[data-role="name"][data-player="O"]'),
    };
    const nameLabelElements = {
      X: nameButtons.X?.querySelector(".scoreboard__name-text") ?? null,
      O: nameButtons.O?.querySelector(".scoreboard__name-text") ?? null,
    };
    const scoreElements = {
      X: document.querySelector('[data-role="score"][data-player="X"]'),
      O: document.querySelector('[data-role="score"][data-player="O"]'),
    };
    const playerCards = {
      X: document.querySelector('.scoreboard__player[data-player="X"]'),
      O: document.querySelector('.scoreboard__player[data-player="O"]'),
    };

    if (
      !statusMessage ||
      !nameButtons.X ||
      !nameButtons.O ||
      !nameLabelElements.X ||
      !nameLabelElements.O ||
      !scoreElements.X ||
      !scoreElements.O ||
      !playerCards.X ||
      !playerCards.O
    ) {
      throw new Error(
        "Unable to initialise status UI; required elements are missing."
      );
    }

    const initialUtils = getNameUtils();
    let playerNames = initialUtils.normaliseNames(initialUtils.defaults);
    let scores = { X: 0, O: 0 };
    let currentPlayer = "X";
    let statusState = "turn"; // "turn" | "win" | "draw"
    /** @type {null | { player: "X" | "O"; button: HTMLButtonElement; form: HTMLFormElement; input: HTMLInputElement; error: HTMLElement | null; field: HTMLElement | null; initialValue: string; }} */
    let activeEditor = null;
    let inlineCommitInProgress = false;

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

    const updateNameDisplay = (player, value) => {
      const label = nameLabelElements[player];
      if (label) {
        label.textContent = value;
      }
      const button = nameButtons[player];
      if (button) {
        button.title = `Edit name for ${value}`;
      }
    };

    const setEditorError = (editor, message) => {
      if (!editor || !editor.input) {
        return;
      }
      const { input, field, error } = editor;
      if (message) {
        input.classList.add("is-invalid");
        input.setAttribute("aria-invalid", "true");
        field?.classList.add("is-invalid");
        if (error) {
          error.hidden = false;
          error.setAttribute("aria-hidden", "false");
          error.textContent = message;
        }
      } else {
        input.classList.remove("is-invalid");
        input.removeAttribute("aria-invalid");
        field?.classList.remove("is-invalid");
        if (error) {
          error.hidden = true;
          error.setAttribute("aria-hidden", "true");
          error.textContent = "";
        }
      }
    };

    const validateInlineEditor = (editor) => {
      if (!editor || !editor.input) {
        return true;
      }
      const utils = getNameUtils();
      const trimmed = editor.input.value.trim();
      if (trimmed && !utils.isNameValid(trimmed)) {
        setEditorError(editor, utils.invalidMessage);
        return false;
      }
      setEditorError(editor, "");
      return true;
    };

    const applyNames = (names) => {
      const utils = getNameUtils();
      const normalised = utils.normaliseNames({
        ...utils.defaults,
        ...playerNames,
        ...(names ?? {}),
      });
      playerNames = normalised;
      updateNameDisplay("X", normalised.X);
      updateNameDisplay("O", normalised.O);
      if (activeEditor && normalised[activeEditor.player]) {
        activeEditor.initialValue = normalised[activeEditor.player];
        if (activeEditor.input) {
          activeEditor.input.value = normalised[activeEditor.player];
        }
        validateInlineEditor(activeEditor);
      }
      refreshStatus();
    };

    const updateScoreDisplay = () => {
      scoreElements.X.textContent = String(scores.X);
      scoreElements.O.textContent = String(scores.O);
    };

    const setActivePlayerCard = (player) => {
      (/** @type {("X" | "O")[]} */ (["X", "O"]))
        .filter((id) => playerCards[id])
        .forEach((id) => {
          playerCards[id].classList.toggle(
            "scoreboard__player--active",
            id === player
          );
        });
    };

    const closeInlineEditor = ({ focusButton = true } = {}) => {
      if (!activeEditor) {
        return;
      }
      const { button, form, player } = activeEditor;
      if (form && form.parentElement) {
        form.parentElement.removeChild(form);
      }
      if (button) {
        button.hidden = false;
        button.removeAttribute("aria-hidden");
        button.setAttribute("aria-expanded", "false");
        if (focusButton && typeof button.focus === "function") {
          button.focus();
        }
      }
      playerCards[player]?.classList.remove("scoreboard__player--editing");
      activeEditor = null;
    };

    const cancelInlineEditor = ({ focusButton = true } = {}) => {
      if (!activeEditor) {
        return;
      }
      const editor = activeEditor;
      if (editor.input) {
        editor.input.value = editor.initialValue;
      }
      setEditorError(editor, "");
      closeInlineEditor({ focusButton });
    };

    const commitInlineEdit = ({ restoreFocus = true } = {}) => {
      if (!activeEditor) {
        return false;
      }
      const editor = activeEditor;
      if (!validateInlineEditor(editor)) {
        editor.input.focus();
        editor.input.select();
        return false;
      }
      const utils = getNameUtils();
      const defaultName = utils.defaults[editor.player];
      const nextName = utils.sanitiseName(editor.input.value, defaultName);
      if (nextName === editor.initialValue) {
        closeInlineEditor({ focusButton: restoreFocus });
        return true;
      }
      const nextNames = { ...playerNames, [editor.player]: nextName };
      let finalNames = nextNames;
      const applyAndPersist = utils.applyAndPersistNames;
      inlineCommitInProgress = true;
      try {
        if (applyAndPersist) {
          const result = applyAndPersist(nextNames, {
            source: "scoreboard-inline",
            propagate: true,
            notify: true,
            persist: true,
            forceFormUpdate: true,
          });
          if (result && typeof result === "object") {
            finalNames = result;
          }
        } else if (
          typeof document !== "undefined" &&
          typeof CustomEvent === "function"
        ) {
          document.dispatchEvent(
            new CustomEvent("settings:players-updated", {
              detail: {
                names: { ...nextNames },
                source: "scoreboard-inline",
              },
            })
          );
          finalNames = utils.normaliseNames(nextNames);
        }
      } catch (error) {
        console.warn("Unable to apply inline player name update", error);
      } finally {
        inlineCommitInProgress = false;
      }
      closeInlineEditor({ focusButton: restoreFocus });
      applyNames(finalNames);
      return true;
    };

    const openInlineEditor = (player) => {
      if (activeEditor?.player === player) {
        return;
      }
      if (activeEditor) {
        closeInlineEditor({ focusButton: false });
      }
      const button = nameButtons[player];
      if (!button) {
        return;
      }
      const utils = getNameUtils();
      const currentValue = playerNames[player] ?? utils.defaults[player];
      const form = document.createElement("form");
      form.className = "scoreboard__name-editor";
      form.noValidate = true;
      form.dataset.player = player;
      const editorId =
        button.getAttribute("aria-controls") ||
        `scoreboard-inline-editor-${player.toLowerCase()}`;
      form.id = editorId;
      button.setAttribute("aria-controls", editorId);
      const field = document.createElement("div");
      field.className = "scoreboard__name-editor-field";
      const input = document.createElement("input");
      input.type = "text";
      input.className = "scoreboard__name-input";
      input.name = `scoreboardPlayer${player}`;
      input.value = currentValue;
      input.placeholder = utils.defaults[player];
      input.maxLength = 24;
      input.autocomplete = "off";
      input.spellcheck = false;
      input.setAttribute("data-player", player);
      input.setAttribute("aria-label", `Player ${player} name`);
      const hintId = `scoreboard-name-hint-${player.toLowerCase()}`;
      const errorId = `scoreboard-name-error-${player.toLowerCase()}`;
      input.setAttribute("aria-describedby", `${hintId} ${errorId}`.trim());
      field.appendChild(input);
      form.appendChild(field);
      const error = document.createElement("p");
      error.className = "scoreboard__name-editor-error";
      error.id = errorId;
      error.hidden = true;
      error.setAttribute("aria-hidden", "true");
      error.setAttribute("role", "alert");
      error.setAttribute("aria-live", "polite");
      form.appendChild(error);
      const hint = document.createElement("p");
      hint.className = "scoreboard__name-editor-hint";
      hint.id = hintId;
      hint.textContent = "Press Enter to save • Esc to cancel";
      form.appendChild(hint);
      button.insertAdjacentElement("afterend", form);
      button.hidden = true;
      button.setAttribute("aria-hidden", "true");
      button.setAttribute("aria-expanded", "true");
      playerCards[player]?.classList.add("scoreboard__player--editing");
      activeEditor = {
        player,
        button,
        form,
        input,
        error,
        field,
        initialValue: currentValue,
      };
      setEditorError(activeEditor, "");
      input.focus();
      input.select();

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        commitInlineEdit({ restoreFocus: true });
      });

      input.addEventListener("input", () => {
        if (activeEditor?.input !== input) {
          return;
        }
        validateInlineEditor(activeEditor);
      });

      input.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          cancelInlineEditor({ focusButton: true });
        }
      });

      input.addEventListener("blur", () => {
        if (activeEditor?.input !== input || inlineCommitInProgress) {
          return;
        }
        window.setTimeout(() => {
          if (!activeEditor || activeEditor.input !== input) {
            return;
          }
          const activeEl = document.activeElement;
          if (activeEl && activeEditor.form.contains(activeEl)) {
            return;
          }
          commitInlineEdit({ restoreFocus: false });
        }, 0);
      });
    };

    nameButtons.X.addEventListener("click", () => {
      openInlineEditor("X");
    });
    nameButtons.O.addEventListener("click", () => {
      openInlineEditor("O");
    });

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
      if (!detail || !detail.names) {
        return;
      }
      applyNames(detail.names);
    });

    document.addEventListener("state:players-changed", (event) => {
      const detail = event?.detail;
      if (!detail || !detail.names) {
        return;
      }
      applyNames(detail.names);
    });

    document.addEventListener("history:players-changed", (event) => {
      const detail = event?.detail;
      if (!detail || !detail.names) {
        return;
      }
      if (detail.source && detail.source !== "history") {
        return;
      }
      applyNames(detail.names);
    });

    applyNames(playerNames);
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
  });
})();
