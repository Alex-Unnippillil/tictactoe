(function () {
  const STORAGE_KEY = "tictactoe:theme";
  const THEMES = {
    LIGHT: "light",
    DARK: "dark",
  };

  const readStoredTheme = () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === THEMES.LIGHT || stored === THEMES.DARK) {
        return stored;
      }
      return null;
    } catch (error) {
      console.warn("Unable to access stored theme preference", error);
      return null;
    }
  };

  const writeStoredTheme = (theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.warn("Unable to persist theme preference", error);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const toggleButton = document.getElementById("themeToggle");
    const iconElement = toggleButton?.querySelector("[data-theme-icon]");
    const textElement = toggleButton?.querySelector("[data-theme-text]");
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    let storedPreference = readStoredTheme();

    const updateToggleVisuals = (theme) => {
      if (!toggleButton) {
        return;
      }

      const isDark = theme === THEMES.DARK;
      toggleButton.setAttribute("aria-pressed", String(isDark));
      const label = isDark ? "Switch to light theme" : "Switch to dark theme";
      toggleButton.setAttribute("aria-label", label);
      toggleButton.setAttribute("title", label);
      if (iconElement) {
        iconElement.textContent = isDark ? "🌙" : "☀️";
      }
      if (textElement) {
        textElement.textContent = isDark ? "Dark theme" : "Light theme";
      }
    };

    const applyTheme = (theme, { persist = true } = {}) => {
      const nextTheme = theme === THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;
      root.dataset.theme = nextTheme;
      root.style.colorScheme = nextTheme;
      updateToggleVisuals(nextTheme);
      if (persist) {
        storedPreference = nextTheme;
        writeStoredTheme(nextTheme);
      }
    };

    const initialTheme = storedPreference
      ? storedPreference
      : mediaQuery.matches
      ? THEMES.DARK
      : THEMES.LIGHT;

    applyTheme(initialTheme, { persist: false });

    const handleMediaChange = (event) => {
      if (storedPreference) {
        return;
      }
      applyTheme(event.matches ? THEMES.DARK : THEMES.LIGHT, { persist: false });
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleMediaChange);
    }

    toggleButton?.addEventListener("click", () => {
      const next = root.dataset.theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
      applyTheme(next);
    });
  });
})();
