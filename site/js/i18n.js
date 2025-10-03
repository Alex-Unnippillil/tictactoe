class I18n {
  constructor({ translations = {}, defaultLanguage = 'en', storageKey = 'tictactoe:language' } = {}) {
    this.translations = translations;
    this.defaultLanguage = defaultLanguage;
    this.storageKey = storageKey;
    this.language = this.#resolveInitialLanguage();
    this.root = document;
    this.#setDocumentLanguage();
  }

  initialize(root = document) {
    this.root = root || document;
    this.applyTranslations();
    this.#dispatchChangeEvent(true);
  }

  setLanguage(languageCode) {
    if (!this.translations[languageCode]) {
      console.warn(`[I18n] Unsupported language: ${languageCode}`);
      return;
    }

    const changed = this.language !== languageCode;
    this.language = languageCode;
    this.#setDocumentLanguage();
    this.#persistLanguage();
    this.applyTranslations();
    this.#dispatchChangeEvent(false, changed);
  }

  getLanguage() {
    return this.language;
  }

  t(key, variables = {}) {
    const dictionary = this.translations[this.language] ?? {};
    const template = dictionary[key];
    if (!template) {
      console.warn(`[I18n] Missing translation for key "${key}" in ${this.language}`);
      return key;
    }

    return template.replace(/\{(\w+)\}/g, (match, placeholder) => {
      if (Object.prototype.hasOwnProperty.call(variables, placeholder)) {
        const value = variables[placeholder];
        return value == null ? '' : value;
      }
      return match;
    });
  }

  applyTranslations(root = this.root) {
    const scope = root || document;
    const nodes = scope.querySelectorAll('[data-i18n-key]');

    nodes.forEach((element) => {
      const key = element.getAttribute('data-i18n-key');
      if (!key) {
        return;
      }

      let args = {};
      const argsAttribute = element.getAttribute('data-i18n-args');
      if (argsAttribute) {
        try {
          args = JSON.parse(argsAttribute);
        } catch (error) {
          console.warn('[I18n] Failed to parse data-i18n-args for', element, error);
        }
      }

      const translation = this.t(key, args);
      const attributeList = element.getAttribute('data-i18n-attr');

      if (attributeList) {
        attributeList
          .split(',')
          .map((attr) => attr.trim())
          .filter(Boolean)
          .forEach((attr) => {
            if (attr === 'text') {
              element.textContent = translation;
            } else if (attr === 'html') {
              element.innerHTML = translation;
            } else {
              element.setAttribute(attr, translation);
            }
          });
        return;
      }

      if (element.tagName === 'TITLE') {
        document.title = translation;
      } else {
        element.textContent = translation;
      }
    });
  }

  #resolveInitialLanguage() {
    const stored = this.#readStoredLanguage();
    if (stored && this.translations[stored]) {
      return stored;
    }
    if (typeof navigator !== 'undefined') {
      const candidates = [navigator.language, ...(navigator.languages || [])]
        .filter(Boolean)
        .map((lang) => lang.split('-')[0]);
      const match = candidates.find((lang) => this.translations[lang]);
      if (match) {
        return match;
      }
    }
    return this.defaultLanguage;
  }

  #readStoredLanguage() {
    try {
      return window.localStorage.getItem(this.storageKey);
    } catch (error) {
      return null;
    }
  }

  #persistLanguage() {
    try {
      window.localStorage.setItem(this.storageKey, this.language);
    } catch (error) {
      // Ignore storage failures (e.g. private browsing).
    }
  }

  #setDocumentLanguage() {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', this.language);
    }
  }

  #dispatchChangeEvent(initial = false, changed = true) {
    const detail = { language: this.language, initial, changed };
    document.dispatchEvent(new CustomEvent('i18n:change', { detail }));
  }
}

window.I18n = I18n;
