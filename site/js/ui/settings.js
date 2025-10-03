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
    const preview = form.querySelector(".modal__preview");
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

    if (preview) {
      const previewOverrides = new Map();
      const appliedPreviewVars = new Set();

      const renderPreview = () => {
        const aggregated = {};
        previewOverrides.forEach((tokens) => {
          if (!tokens || typeof tokens !== "object") {
            return;
          }
          Object.entries(tokens).forEach(([variable, value]) => {
            if (typeof value === "string" && value.trim()) {
              aggregated[variable] = value.trim();
            }
          });
        });

        Array.from(appliedPreviewVars).forEach((variable) => {
          if (!Object.prototype.hasOwnProperty.call(aggregated, variable)) {
            preview.style.removeProperty(variable);
            appliedPreviewVars.delete(variable);
          }
        });

        Object.entries(aggregated).forEach(([variable, value]) => {
          preview.style.setProperty(variable, value);
          appliedPreviewVars.add(variable);
        });
      };

      const updatePreviewSource = (source, tokens) => {
        if (!tokens || Object.keys(tokens).length === 0) {
          previewOverrides.delete(source);
        } else {
          previewOverrides.set(source, tokens);
        }
        renderPreview();
      };

      const toElementArray = (field) => {
        if (!field) {
          return [];
        }
        if (typeof field.forEach === "function" && field !== window) {
          const collected = [];
          field.forEach((item) => {
            if (item) {
              collected.push(item);
            }
          });
          if (collected.length) {
            return collected;
          }
        }
        if (typeof field.length === "number" && field.length > 0) {
          return Array.from(field).filter(Boolean);
        }
        return field instanceof Element ? [field] : [];
      };

      const getActiveOption = (field) => {
        const elements = toElementArray(field);
        if (!elements.length) {
          return null;
        }

        const first = elements[0];
        if (first instanceof HTMLSelectElement) {
          return first.selectedOptions?.[0] ?? null;
        }

        const choice = elements.find((element) => {
          if (!(element instanceof Element)) {
            return false;
          }
          if (element instanceof HTMLInputElement) {
            const type = element.type?.toLowerCase();
            if (type === "radio" || type === "checkbox") {
              return element.checked;
            }
          }
          if (element instanceof HTMLOptionElement) {
            return element.selected;
          }
          return true;
        });

        return choice ?? null;
      };

      const normalisePreviewVar = (key) => {
        if (!key) {
          return null;
        }
        let trimmed = key;
        if (trimmed.startsWith("preview")) {
          trimmed = trimmed.slice("preview".length);
        }
        if (!trimmed) {
          return null;
        }
        const hyphenated = trimmed
          .replace(/^[A-Z]/, (match) => match.toLowerCase())
          .replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
        return `--preview-${hyphenated}`;
      };

      const extractPreviewTokens = (element) => {
        if (!element || typeof element !== "object") {
          return {};
        }

        const tokens = {};
        const dataset = element.dataset ?? {};
        Object.entries(dataset).forEach(([key, value]) => {
          if (!key.startsWith("preview") || typeof value !== "string") {
            return;
          }
          const variable = normalisePreviewVar(key);
          if (variable && value.trim()) {
            tokens[variable] = value.trim();
          }
        });

        if (element instanceof HTMLInputElement) {
          const type = element.type?.toLowerCase();
          if (element.name === "accent" && typeof element.value === "string") {
            const accentValue = element.value.trim();
            if (accentValue) {
              tokens["--preview-accent"] = accentValue;
              if (!tokens["--preview-accent-dark"]) {
                tokens["--preview-accent-dark"] =
                  element.dataset?.accentDark?.trim() || accentValue;
              }
            }
          } else if (type === "color" && element.name && !element.name.startsWith("player")) {
            const colorValue = element.value.trim();
            if (colorValue) {
              const variable = element.dataset?.previewVar
                ? element.dataset.previewVar
                : normalisePreviewVar(element.name);
              if (variable) {
                tokens[variable] = colorValue;
              }
            }
          }
        }

        if (element instanceof HTMLOptionElement) {
          const optionValue = element.value?.trim();
          if (optionValue && element.parentElement?.name === "accent") {
            tokens["--preview-accent"] = optionValue;
            if (!tokens["--preview-accent-dark"]) {
              tokens["--preview-accent-dark"] = optionValue;
            }
          }
        }

        return tokens;
      };

      const attachPreviewListeners = (field, handler) => {
        const elements = toElementArray(field);
        if (!elements.length) {
          return;
        }
        elements.forEach((element) => {
          if (!(element instanceof Element)) {
            return;
          }
          element.addEventListener("change", handler);
          element.addEventListener("input", handler);
        });
        handler();
      };

      const syncThemePreview = () => {
        const field = form.elements.namedItem("theme");
        const active = getActiveOption(field);
        const tokens = extractPreviewTokens(active);
        updatePreviewSource("theme", tokens);
      };

      const syncAccentPreview = () => {
        const field = form.elements.namedItem("accent");
        const active = getActiveOption(field);
        const tokens = extractPreviewTokens(active);
        updatePreviewSource("accent", tokens);
      };

      const themeField = form.elements.namedItem("theme");
      if (themeField) {
        attachPreviewListeners(themeField, syncThemePreview);
      }

      const accentField = form.elements.namedItem("accent");
      if (accentField) {
        attachPreviewListeners(accentField, syncAccentPreview);
      }

      form.addEventListener("reset", () => {
        window.requestAnimationFrame(() => {
          previewOverrides.clear();
          Array.from(appliedPreviewVars).forEach((variable) => {
            preview.style.removeProperty(variable);
            appliedPreviewVars.delete(variable);
          });
          syncThemePreview();
          syncAccentPreview();
        });
      });
    }

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
