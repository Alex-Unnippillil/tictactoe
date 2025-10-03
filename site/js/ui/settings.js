const SYMBOL_CHOICES = ['X', 'O', '△', '⬤', '★', '⬢'];

const DEFAULT_SETTINGS = Object.freeze({
  player1: { symbol: 'X' },
  player2: { symbol: 'O' },
  starting: 'player1'
});

const FIELD_KEYS = ['player1', 'player2'];

function cloneSettings(source) {
  return {
    player1: { symbol: source.player1.symbol },
    player2: { symbol: source.player2.symbol },
    starting: source.starting
  };
}

function settingsEqual(a, b) {
  return (
    a.starting === b.starting &&
    a.player1.symbol === b.player1.symbol &&
    a.player2.symbol === b.player2.symbol
  );
}

export class SettingsController {
  constructor({ form, player1Select, player2Select, startInputs, errorContainer }) {
    this.form = form;
    this.selects = {
      player1: player1Select,
      player2: player2Select
    };
    this.startInputs = Array.from(startInputs || []);
    this.errorContainer = errorContainer;

    this._listeners = new Set();
    this._pending = cloneSettings(DEFAULT_SETTINGS);
    this._active = cloneSettings(DEFAULT_SETTINGS);
    this._lastChangedField = null;
  }

  init() {
    this.#ensureElements();
    this.#populateSymbolOptions();
    this._pending = cloneSettings(DEFAULT_SETTINGS);
    this._active = cloneSettings(DEFAULT_SETTINGS);
    this.#syncFormFromState();
    this.#attachListeners();
    this.#updateIndicators();
    this.#notify();
  }

  onChange(listener) {
    if (typeof listener !== 'function') {
      return () => {};
    }

    this._listeners.add(listener);
    listener(this.#buildPayload());

    return () => {
      this._listeners.delete(listener);
    };
  }

  getActiveSettings() {
    return cloneSettings(this._active);
  }

  getPendingSettings() {
    return cloneSettings(this._pending);
  }

  isValid() {
    return this._pending.player1.symbol !== this._pending.player2.symbol;
  }

  hasUnappliedChanges() {
    return !settingsEqual(this._pending, this._active);
  }

  commitPending() {
    if (!this.isValid()) {
      throw new Error('Cannot apply invalid settings.');
    }

    this._active = this.getPendingSettings();
    this.#updateIndicators();
    this.#notify();

    return this.getActiveSettings();
  }

  focusInvalid() {
    if (this.isValid()) {
      return;
    }

    const fieldKey = this._lastChangedField && FIELD_KEYS.includes(this._lastChangedField)
      ? this._lastChangedField
      : 'player2';

    const element = this.selects[fieldKey];
    if (element) {
      element.focus();
    }
  }

  #ensureElements() {
    FIELD_KEYS.forEach((key) => {
      if (!this.selects[key]) {
        throw new Error(`Missing select element for ${key}`);
      }
    });

    if (!this.form) {
      throw new Error('SettingsController requires a form element.');
    }
  }

  #populateSymbolOptions() {
    FIELD_KEYS.forEach((key) => {
      const select = this.selects[key];
      select.innerHTML = '';
      SYMBOL_CHOICES.forEach((symbol) => {
        const option = document.createElement('option');
        option.value = symbol;
        option.textContent = symbol;
        select.appendChild(option);
      });
    });
  }

  #attachListeners() {
    FIELD_KEYS.forEach((key) => {
      const select = this.selects[key];
      select.addEventListener('change', (event) => {
        const value = event.target.value;
        this._pending[key].symbol = value;
        this._lastChangedField = key;
        this.#updateIndicators();
        this.#notify();
      });
    });

    this.startInputs.forEach((input) => {
      input.addEventListener('change', (event) => {
        if (!event.target.checked) {
          return;
        }
        this._pending.starting = event.target.value;
        this._lastChangedField = 'starting';
        this.#updateIndicators();
        this.#notify();
      });
    });
  }

  #syncFormFromState() {
    FIELD_KEYS.forEach((key) => {
      this.selects[key].value = this._pending[key].symbol;
    });

    this.startInputs.forEach((input) => {
      input.checked = input.value === this._pending.starting;
    });
  }

  #updateIndicators() {
    const valid = this.isValid();
    const hasPending = this.hasUnappliedChanges();

    if (this.form) {
      this.form.dataset.invalid = String(!valid);
      this.form.dataset.pending = String(hasPending);
    }

    if (this.errorContainer) {
      if (!valid) {
        this.errorContainer.hidden = false;
        this.errorContainer.textContent = 'Each player must use a different symbol.';
      } else {
        this.errorContainer.hidden = true;
        this.errorContainer.textContent = '';
      }
    }
  }

  #notify() {
    const payload = this.#buildPayload();
    this._listeners.forEach((listener) => {
      listener(payload);
    });
  }

  #buildPayload() {
    return {
      active: this.getActiveSettings(),
      pending: this.getPendingSettings(),
      valid: this.isValid(),
      hasPendingChanges: this.hasUnappliedChanges()
    };
  }
}
