(function () {
  const NAME_STORAGE_KEY = "tictactoe:player-names";
  const MODE_STORAGE_KEY = "tictactoe:game-mode";
  const DEFAULT_NAMES = {
    X: "Player X",
    O: "Player O",
  };
  const DEFAULT_MODE = "human";
  const MODE_OPTIONS = new Set(["human", "easy", "medium", "hard"]);
  const NAME_PATTERN = /^[\p{L}\p{N}](?:[\p{L}\p{N}\s'.-]{0,23})$/u;

  const sanitiseName = (value, fallback) => {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : fallback;
  };

  const normaliseNames = (names) => ({
    X: sanitiseName(names?.X ?? "", DEFAULT_NAMES.X),
    O: sanitiseName(names?.O ?? "", DEFAULT_NAMES.O),
  });

  const normaliseMode = (value) =>
    MODE_OPTIONS.has(value) ? value : DEFAULT_MODE;

  const readPersistedNames = () => {
    try {
      const raw = window.localStorage.getItem(NAME_STORAGE_KEY);
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
      window.localStorage.setItem(NAME_STORAGE_KEY, JSON.stringify(names));
    } catch (error) {
      console.warn("Unable to persist player names", error);
    }
  };

  const readPersistedMode = () => {
    try {
      const stored = window.localStorage.getItem(MODE_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      return normaliseMode(stored);
    } catch (error) {
      console.warn("Unable to load saved game mode", error);
      return null;
    }
  };

  const writePersistedMode = (mode) => {
    try {
      window.localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.warn("Unable to persist game mode", error);
    }
  };

  const dispatchSettingsUpdate = (names, mode) => {
    document.dispatchEvent(
      new CustomEvent("settings:players-updated", {
        detail: { names: { ...names }, mode },
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

  const getModeField = (form) => ({
    inputs: Array.from(form.querySelectorAll('input[name="mode"]')),
    error: form.querySelector('[data-error-for="mode"]'),
  });

  const validateField = ({ input, error }) => {
    if (!input) {
      return true;
    }

    const trimmed = input.value.trim();
    let message = "";

    if (trimmed && !NAME_PATTERN.test(trimmed)) {
      message =
        "Use letters, numbers, spaces, apostrophes, periods or hyphens only.";
    }

    if (message) {
      input.classList.add("is-invalid");
      input.setCustomValidity(message);
      if (error) {
        error.hidden = false;
        error.textContent = message;
      }
      return false;
    }

    input.classList.remove("is-invalid");
    input.setCustomValidity("");
    if (error) {
      error.hidden = true;
      error.textContent = "";
    }
    return true;
  };

  const attachValidation = (field) => {
    if (!field?.input) {
      return;
    }
    field.input.addEventListener("input", () => {
      validateField(field);
    });
  };

  const validateModeField = ({ inputs, error }) => {
    if (!inputs?.length) {
      return true;
    }

    const selected = inputs.find((input) => input.checked);
    const message = selected ? "" : "Select a game mode to continue.";
    const target = inputs[0];

    if (target) {
      target.setCustomValidity(message);
    }

    if (message) {
      if (error) {
        error.hidden = false;
        error.textContent = message;
      }
      return false;
    }

    if (error) {
      error.hidden = true;
      error.textContent = "";
    }
    return true;
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
    attachValidation(fields.X);
    attachValidation(fields.O);

    const modeField = getModeField(form);

    let currentNames = normaliseNames(readPersistedNames() ?? DEFAULT_NAMES);
    let currentMode = readPersistedMode() ?? DEFAULT_MODE;

    modeField.inputs.forEach((input) => {
      input.addEventListener("change", () => {
        validateModeField(modeField);
      });
    });

    const populateForm = () => {
      if (fields.X.input) {
        fields.X.input.value = currentNames.X;
        validateField(fields.X);
      }
      if (fields.O.input) {
        fields.O.input.value = currentNames.O;
        validateField(fields.O);
      }
      modeField.inputs.forEach((input) => {
        input.checked = input.value === currentMode;
      });
      if (!modeField.inputs.some((input) => input.checked)) {
        const fallback =
          modeField.inputs.find((input) => input.value === DEFAULT_MODE) ??
          modeField.inputs[0];
        if (fallback) {
          fallback.checked = true;
          currentMode = normaliseMode(fallback.value);
        }
      }
      validateModeField(modeField);
    };

    const closeModal = () => {
      if (modal instanceof HTMLDialogElement) {
        modal.close();
      } else {
        modal.setAttribute("open", "false");
      }
    };

    const openModal = () => {
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
      const isModeValid = validateModeField(modeField);

      if (!isValidX || !isValidO || !isModeValid) {
        form.reportValidity();
        return;
      }

      const updated = {
        X: sanitiseName(fields.X.input ? fields.X.input.value : "", DEFAULT_NAMES.X),
        O: sanitiseName(fields.O.input ? fields.O.input.value : "", DEFAULT_NAMES.O),
      };

      const selectedMode = modeField.inputs.find((input) => input.checked);
      const updatedMode = normaliseMode(selectedMode ? selectedMode.value : DEFAULT_MODE);

      currentNames = updated;
      currentMode = updatedMode;
      writePersistedNames(updated);
      writePersistedMode(updatedMode);
      dispatchSettingsUpdate(updated, updatedMode);
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

    populateForm();
    dispatchSettingsUpdate(currentNames, currentMode);
  });
})();
