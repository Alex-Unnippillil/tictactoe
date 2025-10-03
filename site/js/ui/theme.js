(function () {
  var storageKey = 'theme';
  var root = document.documentElement;
  var toggle = document.querySelector('[data-role="theme-toggle"]');
  if (!toggle) {
    return;
  }

  var prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function getStoredTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      // Ignore write errors (e.g., private browsing restrictions)
    }
  }

  function updateToggleLabel(activeTheme) {
    var labelText = activeTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    var label = toggle.querySelector('.theme-toggle__label');
    if (label) {
      label.textContent = labelText;
    } else {
      toggle.textContent = labelText;
    }
    toggle.setAttribute('title', labelText);
  }

  function applyTheme(theme, options) {
    var persist = options && options.persist !== undefined ? options.persist : true;
    if (theme === 'dark' || theme === 'light') {
      root.setAttribute('data-theme', theme);
      if (persist) {
        setStoredTheme(theme);
      }
    }

    var activeTheme = theme;
    if (activeTheme !== 'dark' && activeTheme !== 'light') {
      activeTheme = prefersDarkQuery.matches ? 'dark' : 'light';
    }

    toggle.setAttribute('aria-pressed', activeTheme === 'dark');
    updateToggleLabel(activeTheme);
  }

  function initializeTheme() {
    var storedTheme = getStoredTheme();
    if (storedTheme === 'dark' || storedTheme === 'light') {
      applyTheme(storedTheme, { persist: false });
    } else {
      applyTheme(prefersDarkQuery.matches ? 'dark' : 'light', { persist: false });
    }
  }

  toggle.addEventListener('click', function () {
    var currentTheme = root.getAttribute('data-theme');
    if (currentTheme !== 'dark' && currentTheme !== 'light') {
      currentTheme = prefersDarkQuery.matches ? 'dark' : 'light';
    }

    var nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, { persist: true });
  });

  function handlePreferenceChange(event) {
    var storedTheme = getStoredTheme();
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return;
    }

    applyTheme(event.matches ? 'dark' : 'light', { persist: false });
  }

  if (typeof prefersDarkQuery.addEventListener === 'function') {
    prefersDarkQuery.addEventListener('change', handlePreferenceChange);
  } else if (typeof prefersDarkQuery.addListener === 'function') {
    prefersDarkQuery.addListener(handlePreferenceChange);
  }

  initializeTheme();
})();
