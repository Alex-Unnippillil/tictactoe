(function () {
  const STORAGE_KEY = "tictactoe:player-names";
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

    let currentNames = normaliseNames(readPersistedNames() ?? DEFAULT_NAMES);

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
