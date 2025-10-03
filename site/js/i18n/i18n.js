(function (global) {
  const translationCache = {};
  let currentLocale = 'en';
  let ready = false;
  const localeListeners = new Set();
  let observer = null;

  function getFromPath(source, path) {
    return path.split('.').reduce((value, segment) => {
      if (value && typeof value === 'object' && segment in value) {
        return value[segment];
      }
      return undefined;
    }, source);
  }

  function interpolate(template, params) {
    if (!params) {
      return template;
    }
    return template.replace(/\{([^}]+)\}/g, function (_, token) {
      return Object.prototype.hasOwnProperty.call(params, token)
        ? params[token]
        : '{' + token + '}';
    });
  }

  function resolveTranslation(key) {
    const translations = translationCache[currentLocale] || {};
    const value = getFromPath(translations, key);
    return value !== undefined ? value : key;
  }

  function translate(key, params) {
    const value = resolveTranslation(key);
    if (typeof value === 'string') {
      return interpolate(value, params);
    }
    return value;
  }

  function parseParams(value) {
    if (!value) {
      return undefined;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn('Unable to parse i18n params for', value, error);
      return undefined;
    }
  }

  function applyTranslationToElement(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE && element !== document) {
      return;
    }

    if (element === document) {
      applyTranslations(document.documentElement);
      return;
    }

    const key = element.getAttribute('data-i18n-key');
    if (!key) {
      return;
    }

    const params = parseParams(element.getAttribute('data-i18n-params'));
    const attr = element.getAttribute('data-i18n-attr');
    const text = translate(key, params);

    if (attr) {
      element.setAttribute(attr, text);
    } else {
      element.textContent = text;
    }
  }

  function applyTranslations(root) {
    const scope = root || document;
    if (!scope) {
      return;
    }

    if (scope.nodeType === Node.ELEMENT_NODE && scope.matches('[data-i18n-key]')) {
      applyTranslationToElement(scope);
    }

    const elements = scope.querySelectorAll ? scope.querySelectorAll('[data-i18n-key]') : [];
    elements.forEach(applyTranslationToElement);
  }

  function ensureObserver() {
    if (observer || !document.body) {
      return;
    }

    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'attributes') {
          applyTranslationToElement(mutation.target);
        }

        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              applyTranslations(node);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-i18n-key', 'data-i18n-params', 'data-i18n-attr'],
      childList: true,
      subtree: true
    });
  }

  function loadTranslations(locale) {
    if (translationCache[locale]) {
      return Promise.resolve(translationCache[locale]);
    }

    return fetch('site/i18n/' + locale + '.json')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to load translations for "' + locale + '"');
        }
        return response.json();
      })
      .then(function (data) {
        translationCache[locale] = data;
        return data;
      });
  }

  function notifyLocaleChange() {
    localeListeners.forEach(function (callback) {
      callback(currentLocale);
    });
  }

  function setLocale(locale) {
    return loadTranslations(locale).then(function () {
      currentLocale = locale;
      ready = true;
      applyTranslations(document);
      notifyLocaleChange();
      return currentLocale;
    });
  }

  function init(options) {
    const locale = options && options.locale ? options.locale : currentLocale;
    return setLocale(locale).then(function (activeLocale) {
      ensureObserver();
      return activeLocale;
    });
  }

  function onLocaleChange(callback) {
    if (typeof callback === 'function') {
      localeListeners.add(callback);
      if (ready) {
        callback(currentLocale);
      }
    }

    return function () {
      localeListeners.delete(callback);
    };
  }

  function clearElementTranslation(element) {
    if (!element) {
      return;
    }

    element.removeAttribute('data-i18n-key');
    element.removeAttribute('data-i18n-params');
    element.removeAttribute('data-i18n-attr');
  }

  function setElementTranslation(element, key, params, attr) {
    if (!element) {
      return;
    }

    if (key) {
      element.setAttribute('data-i18n-key', key);
    } else {
      element.removeAttribute('data-i18n-key');
    }

    if (params && Object.keys(params).length > 0) {
      element.setAttribute('data-i18n-params', JSON.stringify(params));
    } else {
      element.removeAttribute('data-i18n-params');
    }

    if (attr) {
      element.setAttribute('data-i18n-attr', attr);
    } else {
      element.removeAttribute('data-i18n-attr');
    }

    applyTranslationToElement(element);
  }

  global.I18n = {
    init: init,
    setLocale: setLocale,
    t: function (key, params) {
      return translate(key, params);
    },
    applyTranslations: applyTranslations,
    updateElement: applyTranslationToElement,
    setElementTranslation: setElementTranslation,
    clearElementTranslation: clearElementTranslation,
    onLocaleChange: onLocaleChange,
    isReady: function () {
      return ready;
    }
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    ensureObserver();
  } else {
    document.addEventListener('DOMContentLoaded', ensureObserver);
  }
})(window);
