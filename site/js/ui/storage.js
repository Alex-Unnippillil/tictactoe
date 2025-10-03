(function () {
  if (window.appStorage && typeof window.appStorage === "object") {
    return;
  }

  const hasLocalStorage = () => {
    try {
      return typeof window.localStorage !== "undefined";
    } catch (error) {
      console.warn("LocalStorage is not accessible", error);
      return false;
    }
  };

  const readJson = (key, validator) => {
    if (!hasLocalStorage()) {
      return null;
    }
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
      console.warn(`Unable to read persisted data for ${key}`, error);
      return null;
    }
  };

  const writeJson = (key, value) => {
    if (!hasLocalStorage()) {
      return false;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Unable to persist data for ${key}`, error);
      return false;
    }
  };

  const remove = (key) => {
    if (!hasLocalStorage()) {
      return false;
    }
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Unable to remove persisted data for ${key}`, error);
      return false;
    }
  };

  window.appStorage = { readJson, writeJson, remove };
})();
