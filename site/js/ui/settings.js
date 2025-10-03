(function () {
  const STORAGE_KEY = "tictactoe:player-names";
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

  const readPersistedNames = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      return normaliseNames(parsed);
    } catch (error) {
      console.warn("Unable to load saved player names", error);
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
    let currentNames = normaliseNames(readPersistedNames() ?? DEFAULT_NAMES);
    let isModalOpen = false;
    let fieldsDirty = false;
    let suppressExternalUpdate = false;

    const markDirty = () => {
      fieldsDirty = true;
    };

    const populateForm = (names = currentNames) => {
      if (fields.X.input) {
        fields.X.input.value = names.X;
        validateField(fields.X);
      }
      if (fields.O.input) {
        fields.O.input.value = names.O;
        validateField(fields.O);
      }
      fieldsDirty = false;
    };

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
        populateForm(finalNames);
      }

      return finalNames;
    };

    attachValidation(fields.X, { onDirty: markDirty });
    attachValidation(fields.O, { onDirty: markDirty });

    const closeModal = () => {
      isModalOpen = false;
      if (modal instanceof HTMLDialogElement) {
        modal.close();
      } else {
        modal.setAttribute("open", "false");
      }
      populateForm();
    };

    const openModal = () => {
      isModalOpen = true;
      populateForm();
      if (modal instanceof HTMLDialogElement) {
        modal.showModal();
      } else {
        modal.setAttribute("open", "true");
      }
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

      applyAndPersistNames(updated, {
        source: "settings",
        propagate: true,
        notify: true,
        persist: true,
        forceFormUpdate: false,
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

    applyAndPersistNames(currentNames, {
      source: "settings:init",
      propagate: true,
      notify: true,
      persist: true,
      forceFormUpdate: false,
    });
  });
})();
