(function () {
  const STORAGE_KEY = "tictactoe:player-names";
  const LEGACY_NAME_STORAGE_KEYS = ["tictactoe:names"];
  const coreDefaults = window.coreState?.DEFAULT_NAMES;
  const DEFAULT_NAMES = {
    X: coreDefaults?.X ?? "Player X",
    O: coreDefaults?.O ?? "Player O",
  };
  const NAME_PATTERN =
    window.coreState?.NAME_PATTERN ??
    /^[\p{L}\p{N}](?:[\p{L}\p{N}\s'.-]{0,23})$/u;
  const INVALID_MESSAGE =
    "Use letters, numbers, spaces, apostrophes, periods or hyphens only.";

  const APPEARANCE_STORAGE_KEY = "tictactoe:appearance";
  const THEME_OPTIONS = new Set(["system", "light", "dark"]);
  const ACCENT_OPTIONS = new Set(["sky", "violet", "emerald", "amber", "rose"]);
  const DEFAULT_APPEARANCE = { theme: "system", accent: "sky" };

  const normaliseAppearance = (appearance = {}) => {
    const themeValue = THEME_OPTIONS.has(appearance.theme)
      ? appearance.theme
      : DEFAULT_APPEARANCE.theme;
    const accentValue = ACCENT_OPTIONS.has(appearance.accent)
      ? appearance.accent
      : DEFAULT_APPEARANCE.accent;
    return { theme: themeValue, accent: accentValue };
  };

  const readPersistedAppearance = () => {
    try {
      const raw = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      return normaliseAppearance(parsed);
    } catch (error) {
      console.warn("Unable to load saved appearance", error);
      return null;
    }
  };

  const writePersistedAppearance = (appearance) => {
    try {
      window.localStorage.setItem(
        APPEARANCE_STORAGE_KEY,
        JSON.stringify(appearance)
      );
    } catch (error) {
      console.warn("Unable to persist appearance", error);
    }
  };

  const dispatchAppearanceUpdate = (appearance, source = "settings") => {
    if (typeof document === "undefined" || typeof CustomEvent !== "function") {
      return;
    }
    document.dispatchEvent(
      new CustomEvent("settings:appearance-updated", {
        detail: { appearance: { ...appearance }, source },
      })
    );
  };

  const applyDocumentAppearance = (appearance) => {
    if (typeof document === "undefined") {
      return;
    }
    const root = document.documentElement;
    if (!root) {
      return;
    }

    const { theme, accent } = normaliseAppearance(appearance);

    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }

    if (accent) {
      root.setAttribute("data-accent", accent);
    } else {
      root.removeAttribute("data-accent");
    }
  };

  const initialAppearance = normaliseAppearance(
    readPersistedAppearance() ?? DEFAULT_APPEARANCE
  );
  applyDocumentAppearance(initialAppearance);
  let currentAppearance = { ...initialAppearance };

  const isNameValid = (value) =>
    typeof value === "string" && NAME_PATTERN.test(value);

  const sanitiseName = (value, fallback) => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (!trimmed) {
      return fallback;
    }
    return isNameValid(trimmed) ? trimmed : fallback;
  };

  const normaliseNames = (names) => ({
    X: sanitiseName(names?.X ?? "", DEFAULT_NAMES.X),
    O: sanitiseName(names?.O ?? "", DEFAULT_NAMES.O),
  });

  const readNamesFromStorage = (key, errorMessage) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      return normaliseNames(parsed);
    } catch (error) {
      const message =
        typeof errorMessage === "string"
          ? errorMessage
          : `Unable to load player names from storage key \"${key}\"`;
      console.warn(message, error);
      return null;
    }
  };

  const writePersistedNames = (names) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
    } catch (error) {
      console.warn("Unable to persist player names", error);
    }
  };

  const readPersistedNames = () => {
    const stored = readNamesFromStorage(
      STORAGE_KEY,
      "Unable to load saved player names"
    );
    if (stored) {
      return stored;
    }

    for (const legacyKey of LEGACY_NAME_STORAGE_KEYS) {
      const legacy = readNamesFromStorage(
        legacyKey,
        "Unable to load legacy player names"
      );
      if (!legacy) {
        continue;
      }

      try {
        window.localStorage.removeItem(legacyKey);
      } catch (error) {
        console.warn(
          `Unable to remove legacy player names from storage key \"${legacyKey}\"`,
          error
        );
      }

      writePersistedNames(legacy);
      return legacy;
    }

    return null;
  };

  const dispatchNameUpdate = (names) => {
    if (typeof document === "undefined" || typeof CustomEvent !== "function") {
      return;
    }
    document.dispatchEvent(
      new CustomEvent("settings:players-updated", {
        detail: { names: { ...names } },
      })
    );
  };

  const getFieldElements = (form) => ({
    X: {
      input: form.querySelector('input[name="playerX"]'),
      error: form.querySelector('[data-error-for="playerX"]'),
    },
    O: {
      input: form.querySelector('input[name="playerO"]'),
      error: form.querySelector('[data-error-for="playerO"]'),
    },
  });

  const validateField = ({ input, error }) => {
    if (!input) {
      return true;
    }

    const trimmed = input.value.trim();
    let message = "";
    const control = input.closest(".field__control");

    if (trimmed && !isNameValid(trimmed)) {
      message = INVALID_MESSAGE;
    }

    if (message) {
      input.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
      input.setCustomValidity(message);
      if (control) {
        control.classList.add("is-invalid");
      }
      if (error) {
        error.hidden = false;
        error.setAttribute("aria-hidden", "false");
        error.textContent = message;
      }
      return false;
    }

    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
    input.setCustomValidity("");
    if (control) {
      control.classList.remove("is-invalid");
    }
    if (error) {
      error.hidden = true;
      error.setAttribute("aria-hidden", "true");
      error.textContent = "";
    }
    return true;
  };

  const attachValidation = (field, { onDirty } = {}) => {
    if (!field?.input) {
      return;
    }

    if (field.error) {
      field.error.setAttribute("role", "alert");
      field.error.setAttribute("aria-live", "polite");
      field.error.setAttribute(
        "aria-hidden",
        field.error.hidden ? "true" : "false"
      );
      if (field.error.id) {
        const describedBy = field.input.getAttribute("aria-describedby");
        if (!describedBy) {
          field.input.setAttribute("aria-describedby", field.error.id);
        } else if (!describedBy.split(/\s+/).includes(field.error.id)) {
          field.input.setAttribute(
            "aria-describedby",
            `${describedBy} ${field.error.id}`
          );
        }
      }
    }

    field.input.addEventListener("input", () => {
      if (typeof onDirty === "function") {
        onDirty();
      }
      validateField(field);
    });

    field.input.addEventListener("blur", () => {
      validateField(field);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("settingsModal");
    const form = document.getElementById("settingsForm");
    const openButton = document.getElementById("settingsButton");
    const cancelButton = document.getElementById("settingsCancelButton");

    if (!modal || !form || !openButton) {
      return;
    }

    const fields = getFieldElements(form);
    const themeInputs = Array.from(
      form.querySelectorAll('input[name="theme"]')
    );
    const accentInputs = Array.from(
      form.querySelectorAll('input[name="accent"]')
    );
    let currentNames = normaliseNames(readPersistedNames() ?? DEFAULT_NAMES);
    currentAppearance = normaliseAppearance(
      readPersistedAppearance() ?? currentAppearance
    );
    let isModalOpen = false;
    let fieldsDirty = false;
    let suppressExternalUpdate = false;
    const modalStates = {
      entering: "modal--entering",
      leaving: "modal--leaving",
      open: "modal--open",
    };
    const modalAnimations = {
      enter: "modal-fade-in",
      exit: "modal-fade-out",
    };
    let enterAnimationHandler = null;
    let exitAnimationHandler = null;
    let closeAnimationFallback = null;

    const prefersReducedMotion = () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clearEnterAnimation = () => {
      if (enterAnimationHandler && modal) {
        modal.removeEventListener("animationend", enterAnimationHandler);
        enterAnimationHandler = null;
      }
    };

    const clearExitAnimation = () => {
      if (exitAnimationHandler && modal) {
        modal.removeEventListener("animationend", exitAnimationHandler);
        exitAnimationHandler = null;
      }
    };

    const clearCloseFallback = () => {
      if (typeof closeAnimationFallback === "number") {
        window.clearTimeout(closeAnimationFallback);
      }
      closeAnimationFallback = null;
    };

    const markDirty = () => {
      fieldsDirty = true;
    };

    const populateForm = (
      names = currentNames,
      appearance = currentAppearance
    ) => {
      if (fields.X.input) {
        fields.X.input.value = names.X;
        validateField(fields.X);
      }
      if (fields.O.input) {
        fields.O.input.value = names.O;
        validateField(fields.O);
      }

      if (themeInputs.length) {
        let matchedTheme = false;
        themeInputs.forEach((input) => {
          const shouldCheck = input.value === appearance.theme;
          input.checked = shouldCheck;
          if (shouldCheck) {
            matchedTheme = true;
          }
        });
        if (!matchedTheme) {
          themeInputs.forEach((input) => {
            input.checked = input.value === DEFAULT_APPEARANCE.theme;
          });
        }
      }

      if (accentInputs.length) {
        let matchedAccent = false;
        accentInputs.forEach((input) => {
          const shouldCheck = input.value === appearance.accent;
          input.checked = shouldCheck;
          if (shouldCheck) {
            matchedAccent = true;
          }
        });
        if (!matchedAccent) {
          accentInputs.forEach((input) => {
            input.checked = input.value === DEFAULT_APPEARANCE.accent;
          });
        }
      }

      fieldsDirty = false;
    };

    themeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        markDirty();
      });
    });

    accentInputs.forEach((input) => {
      input.addEventListener("change", () => {
        markDirty();
      });
    });

    const syncToExternalModules = (names, source = "settings") => {
      let latest = { ...names };

      const core = window.coreState;
      if (core && typeof core.setPlayerNames === "function") {
        suppressExternalUpdate = true;
        try {
          const result = core.setPlayerNames(names, { source });
          if (result && typeof result === "object") {
            latest = normaliseNames(result);
          }
        } catch (error) {
          console.warn(
            "Unable to synchronise player names with core state",
            error
          );
        } finally {
          suppressExternalUpdate = false;
        }
      }

      const history = window.gameHistory;
      if (history && typeof history.setPlayerNames === "function") {
        try {
          history.setPlayerNames(latest, { source });
        } catch (error) {
          console.warn(
            "Unable to synchronise player names with history",
            error
          );
        }
      }

      const share = window.shareLinks;
      if (share && typeof share.updatePlayerNames === "function") {
        try {
          share.updatePlayerNames({ ...latest });
        } catch (error) {
          console.warn(
            "Unable to synchronise player names with share links",
            error
          );
        }
      }

      return latest;
    };

    const applyAndPersistNames = (names, options = {}) => {
      const {
        persist = true,
        notify = true,
        propagate = true,
        source = "settings",
        forceFormUpdate = false,
      } = options;

      const normalised = normaliseNames(names);
      currentNames = normalised;

      if (persist) {
        writePersistedNames(normalised);
      }

      let finalNames = normalised;
      if (propagate) {
        finalNames = syncToExternalModules(normalised, source);
        currentNames = finalNames;
      }

      if (notify) {
        dispatchNameUpdate(finalNames);
      }

      if (forceFormUpdate || !isModalOpen || !fieldsDirty) {
        populateForm(finalNames, currentAppearance);
      }

      return finalNames;
    };

    const readAppearanceFromForm = () => {
      const getCheckedValue = (inputs, fallback) => {
        const selected = inputs.find((input) => input.checked);
        return selected ? selected.value : fallback;
      };

      return normaliseAppearance({
        theme: getCheckedValue(themeInputs, currentAppearance.theme),
        accent: getCheckedValue(accentInputs, currentAppearance.accent),
      });
    };

    const applyAndPersistAppearance = (appearance, options = {}) => {
      const {
        persist = true,
        notify = true,
        updateForm = true,
        source = "settings",
      } = options;

      const next = normaliseAppearance(appearance);
      currentAppearance = next;

      if (persist) {
        writePersistedAppearance(next);
      }

      applyDocumentAppearance(next);

      if (notify) {
        dispatchAppearanceUpdate(next, source);
      }

      if (updateForm && (!isModalOpen || !fieldsDirty)) {
        populateForm(currentNames, next);
      }

      return next;
    };

    attachValidation(fields.X, { onDirty: markDirty });
    attachValidation(fields.O, { onDirty: markDirty });

    const closeModal = () => {
      isModalOpen = false;
      if (!modal) {
        return;
      }

      const isDialogElement = modal instanceof HTMLDialogElement;
      const isOpen =
        (isDialogElement && modal.open) || modal.hasAttribute("open");

      if (!isOpen) {
        populateForm();
        return;
      }

      const finishClose = () => {
        clearExitAnimation();
        clearCloseFallback();
        modal.classList.remove(
          modalStates.entering,
          modalStates.leaving,
          modalStates.open,
          "is-closing"
        );
        if (isDialogElement) {
          if (modal.open) {
            try {
              modal.close();
            } catch (error) {
              console.warn("Unable to close settings dialog", error);
            }
          }
        } else {
          modal.removeAttribute("open");
        }
        populateForm();
      };

      const reduceMotion = prefersReducedMotion();

      clearEnterAnimation();
      clearCloseFallback();

      if (reduceMotion) {
        finishClose();
        return;
      }

      if (modal.classList.contains(modalStates.leaving)) {
        return;
      }

      const handleAnimationEnd = (event) => {
        if (event.target !== modal || event.animationName !== modalAnimations.exit) {
          return;
        }
        finishClose();
      };

      exitAnimationHandler = handleAnimationEnd;
      modal.addEventListener("animationend", handleAnimationEnd);

      modal.classList.remove(modalStates.entering, modalStates.open, "is-closing");
      // Trigger reflow so the exit animation restarts consistently.
      void modal.offsetWidth;
      modal.classList.add(modalStates.leaving);

      closeAnimationFallback = window.setTimeout(finishClose, 450);
    };

    const openModal = () => {
      isModalOpen = true;
      populateForm();
      if (!modal) {
        return;
      }

      const isDialogElement = modal instanceof HTMLDialogElement;

      if (isDialogElement) {
        if (!modal.open) {
          modal.showModal();
        }
      } else {
        modal.setAttribute("open", "true");
      }

      clearExitAnimation();
      clearCloseFallback();

      modal.classList.remove(modalStates.leaving, "is-closing");

      const reduceMotion = prefersReducedMotion();

      if (reduceMotion) {
        modal.classList.remove(modalStates.entering);
        modal.classList.add(modalStates.open);
        return;
      }

      const handleAnimationEnd = (event) => {
        if (event.target !== modal || event.animationName !== modalAnimations.enter) {
          return;
        }
        modal.classList.remove(modalStates.entering);
        modal.classList.add(modalStates.open);
        clearEnterAnimation();
      };

      clearEnterAnimation();
      enterAnimationHandler = handleAnimationEnd;
      modal.addEventListener("animationend", handleAnimationEnd);

      modal.classList.remove(modalStates.entering, modalStates.open);
      // Force a reflow to allow re-triggering the entry animation.
      void modal.offsetWidth;
      modal.classList.add(modalStates.entering);
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      const isValidX = validateField(fields.X);
      const isValidO = validateField(fields.O);

      if (!isValidX || !isValidO) {
        if (typeof form.reportValidity === "function") {
          form.reportValidity();
        }
        return;
      }

      const updated = {
        X: fields.X.input ? fields.X.input.value : "",
        O: fields.O.input ? fields.O.input.value : "",
      };
      const nextAppearance = readAppearanceFromForm();

      applyAndPersistNames(updated, {
        source: "settings",
        propagate: true,
        notify: true,
        persist: true,
        forceFormUpdate: false,
      });

      applyAndPersistAppearance(nextAppearance, {
        source: "settings",
        persist: true,
        notify: true,
        updateForm: false,
      });

      closeModal();
    };

    openButton.addEventListener("click", () => {
      openModal();
    });

    cancelButton?.addEventListener("click", (event) => {
      event.preventDefault();
      closeModal();
    });

    form.addEventListener("submit", handleSubmit);

    if (modal instanceof HTMLDialogElement) {
      modal.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeModal();
      });
    }

    document.addEventListener("settings:appearance-updated", (event) => {
      const detail = event?.detail;
      if (!detail || !detail.appearance) {
        return;
      }
      if (
        detail.source &&
        typeof detail.source === "string" &&
        detail.source.startsWith("settings")
      ) {
        return;
      }

      applyAndPersistAppearance(detail.appearance, {
        source: detail.source ?? "external",
        persist: true,
        notify: false,
        updateForm: true,
      });
    });

    document.addEventListener("state:players-changed", (event) => {
      if (suppressExternalUpdate) {
        return;
      }
      const detail = event?.detail;
      if (!detail || !detail.names) {
        return;
      }

      applyAndPersistNames(detail.names, {
        source: detail.source ?? "core",
        propagate: false,
        notify: true,
        persist: true,
        forceFormUpdate: true,
      });
    });

    document.addEventListener("history:players-changed", (event) => {
      if (suppressExternalUpdate) {
        return;
      }
      const detail = event?.detail;
      if (!detail || !detail.names) {
        return;
      }
      if (detail.source && detail.source !== "history") {
        return;
      }

      applyAndPersistNames(detail.names, {
        source: "history",
        propagate: true,
        notify: true,
        persist: true,
        forceFormUpdate: true,
      });
    });

    applyAndPersistAppearance(currentAppearance, {
      source: "settings:init",
      persist: true,
      notify: true,
      updateForm: false,
    });

    applyAndPersistNames(currentNames, {
      source: "settings:init",
      propagate: true,
      notify: true,
      persist: true,
      forceFormUpdate: false,
    });
  });
})();
