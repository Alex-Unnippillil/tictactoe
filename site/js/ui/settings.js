'use strict';

import {
  DEFAULT_PLAYER_NAMES,
  normaliseNames,
  sanitiseName
} from '../core/players.js';

const STORAGE_KEY = 'tictactoe:player-names';
const NAME_PATTERN = /^[\p{L}\p{N}](?:[\p{L}\p{N}\s'.-]{0,23})$/u;

function readPersistedNames(storage, defaults) {
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return normaliseNames(parsed, defaults);
  } catch (error) {
    console.warn('Unable to load saved player names', error);
    return null;
  }
}

function writePersistedNames(storage, names) {
  if (!storage) {
    return;
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(names));
  } catch (error) {
    console.warn('Unable to persist player names', error);
  }
}

function getFieldElements(form) {
  if (!form) {
    return {
      X: {},
      O: {}
    };
  }
  return {
    X: {
      input: form.querySelector('input[name="playerX"]'),
      error: form.querySelector('[data-error-for="playerX"]')
    },
    O: {
      input: form.querySelector('input[name="playerO"]'),
      error: form.querySelector('[data-error-for="playerO"]')
    }
  };
}

function validateField(field) {
  if (!field?.input) {
    return true;
  }

  const trimmed = field.input.value.trim();
  let message = '';

  if (trimmed && !NAME_PATTERN.test(trimmed)) {
    message =
      "Use letters, numbers, spaces, apostrophes, periods or hyphens only.";
  }

  if (message) {
    field.input.classList.add('is-invalid');
    if (typeof field.input.setCustomValidity === 'function') {
      field.input.setCustomValidity(message);
    }
    if (field.error) {
      field.error.hidden = false;
      field.error.textContent = message;
    }
    return false;
  }

  field.input.classList.remove('is-invalid');
  if (typeof field.input.setCustomValidity === 'function') {
    field.input.setCustomValidity('');
  }
  if (field.error) {
    field.error.hidden = true;
    field.error.textContent = '';
  }
  return true;
}

function attachValidation(field) {
  if (!field?.input) {
    return;
  }
  field.input.addEventListener('input', () => {
    validateField(field);
  });
}

export function initSettings(options = {}) {
  const {
    document: doc = document,
    storage = globalThis?.localStorage ?? null,
    onPlayersUpdated,
    defaultNames = DEFAULT_PLAYER_NAMES
  } = options;

  if (!doc) {
    throw new Error('A document reference is required to initialise settings.');
  }

  const fallbackNames = normaliseNames(defaultNames, DEFAULT_PLAYER_NAMES);
  const persistedNames = readPersistedNames(storage, fallbackNames);
  let currentNames = persistedNames ?? fallbackNames;

  const modal = doc.getElementById('settingsModal');
  const form = doc.getElementById('settingsForm');
  const openButton = doc.getElementById('settingsButton');
  const cancelButton = doc.getElementById('settingsCancelButton');

  const notify = (names) => {
    if (typeof onPlayersUpdated === 'function') {
      onPlayersUpdated({ ...names });
    }
  };

  if (!modal || !form || !openButton) {
    notify(currentNames);
    return {
      close() {},
      getCurrentNames: () => ({ ...currentNames }),
      open() {},
      setNames(names) {
        currentNames = normaliseNames(names, fallbackNames);
        writePersistedNames(storage, currentNames);
        notify(currentNames);
      }
    };
  }

  const fields = getFieldElements(form);
  attachValidation(fields.X);
  attachValidation(fields.O);

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
      modal.setAttribute('open', 'false');
    }
  };

  const openModal = () => {
    populateForm();
    if (modal instanceof HTMLDialogElement) {
      modal.showModal();
    } else {
      modal.setAttribute('open', 'true');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const isValidX = validateField(fields.X);
    const isValidO = validateField(fields.O);

    if (!isValidX || !isValidO) {
      if (typeof form.reportValidity === 'function') {
        form.reportValidity();
      }
      return;
    }

    const updated = {
      X: sanitiseName(fields.X.input ? fields.X.input.value : '', fallbackNames.X),
      O: sanitiseName(fields.O.input ? fields.O.input.value : '', fallbackNames.O)
    };

    currentNames = normaliseNames(updated, fallbackNames);
    writePersistedNames(storage, currentNames);
    notify(currentNames);
    closeModal();
  };

  openButton.addEventListener('click', openModal);

  cancelButton?.addEventListener('click', (event) => {
    event.preventDefault();
    closeModal();
  });

  form.addEventListener('submit', handleSubmit);

  if (modal instanceof HTMLDialogElement) {
    modal.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeModal();
    });
  }

  populateForm();
  notify(currentNames);

  return {
    close: closeModal,
    getCurrentNames: () => ({ ...currentNames }),
    open: openModal,
    setNames(names) {
      currentNames = normaliseNames(names, fallbackNames);
      writePersistedNames(storage, currentNames);
      populateForm();
      notify(currentNames);
    }
  };
}
