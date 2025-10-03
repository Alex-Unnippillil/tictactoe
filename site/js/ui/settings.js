(function () {
  const STORAGE_KEY = "tictactoe:player-names";
  const storage =
    window.appStorage && typeof window.appStorage === "object"
      ? window.appStorage
      : {
          readJson(key, validator) {
            try {
              const raw = window.localStorage.getItem(key);
              if (raw === null) {
                return null;
              }
              const parsed = JSON.parse(raw);
              if (validator && !validator(parsed)) {
                return null;
              }
              return parsed;
            } catch (error) {
              console.warn("Unable to load saved player names", error);
              return null;
            }
          },
          writeJson(key, value) {
            try {
              window.localStorage.setItem(key, JSON.stringify(value));
              return true;
            } catch (error) {
              console.warn("Unable to persist player names", error);
              return false;
            }
          },
          remove(key) {
            try {
              window.localStorage.removeItem(key);
              return true;
            } catch (error) {
              console.warn("Unable to remove saved player names", error);
              return false;
            }
          },
        };
  const DEFAULT_NAMES = {
    X: "Player X",
    O: "Player O",
  };
  const NAME_PATTERN = /^[\p{L}\p{N}](?:[\p{L}\p{N}\s'.-]{0,23})$/u;

  const sanitiseName = (value, fallback) => {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : fallback;
  };

  const normaliseNames = (names) => ({
    X: sanitiseName(names?.X ?? "", DEFAULT_NAMES.X),
    O: sanitiseName(names?.O ?? "", DEFAULT_NAMES.O),
  });

  const readPersistedNames = () =>
    normaliseNames(
      storage.readJson(
        STORAGE_KEY,
        (value) => value && typeof value === "object" && !Array.isArray(value)
      ) ?? DEFAULT_NAMES
    );

  const writePersistedNames = (names) => {
    storage.writeJson(STORAGE_KEY, names);
  };

  const dispatchNameUpdate = (names) => {
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

    let currentNames = readPersistedNames();

    const populateForm = () => {
      if (fields.X.input) {
        fields.X.input.value = currentNames.X;
        validateField(fields.X);
      }
      if (fields.O.input) {
        fields.O.input.value = currentNames.O;
        validateField(fields.O);
      }
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

      if (!isValidX || !isValidO) {
        form.reportValidity();
        return;
      }

      const updated = {
        X: sanitiseName(fields.X.input ? fields.X.input.value : "", DEFAULT_NAMES.X),
        O: sanitiseName(fields.O.input ? fields.O.input.value : "", DEFAULT_NAMES.O),
      };

      currentNames = updated;
      writePersistedNames(updated);
      dispatchNameUpdate(updated);
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
    dispatchNameUpdate(currentNames);
  });
})();
