(function () {
  if (window.__tictactoePwaInstallInitialised) {
    return;
  }
  window.__tictactoePwaInstallInitialised = true;

  let deferredPromptEvent = null;
  let installButton = null;

  const isStandalone = () => {
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        return true;
      }
    } catch (error) {
      /* noop */
    }
    return Boolean(window.navigator?.standalone);
  };

  const findMountPoint = () =>
    document.querySelector('[data-install-slot]') ||
    document.querySelector('.toolbar__actions') ||
    document.querySelector('[data-role="toolbar-actions"]');

  const updateButtonState = () => {
    if (!installButton) {
      return;
    }
    const shouldShow = Boolean(deferredPromptEvent) && !isStandalone();
    installButton.hidden = !shouldShow;
    installButton.disabled = !shouldShow;
    if (!shouldShow) {
      installButton.blur?.();
    }
  };

  const handleAppInstalled = () => {
    deferredPromptEvent = null;
    updateButtonState();
  };

  const handleInstallClick = async (event) => {
    event.preventDefault();
    if (!deferredPromptEvent || !installButton) {
      return;
    }

    installButton.disabled = true;

    try {
      deferredPromptEvent.prompt();
      const choice = await deferredPromptEvent.userChoice;
      if (choice?.outcome !== 'accepted') {
        // Leave room for future re-prompts when the browser fires the event again.
      }
    } catch (error) {
      console.warn('Unable to show install prompt', error);
    } finally {
      deferredPromptEvent = null;
      updateButtonState();
    }
  };

  const ensureInstallButton = () => {
    if (installButton) {
      return installButton;
    }

    if (isStandalone()) {
      return null;
    }

    const existing = document.querySelector('[data-role="install-button"]');
    if (existing instanceof HTMLButtonElement) {
      installButton = existing;
    } else {
      const mountPoint = findMountPoint();
      if (!mountPoint) {
        return null;
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.id = 'installButton';
      button.className = 'button button--ghost';
      button.textContent = 'Install app';
      button.setAttribute('aria-label', 'Install the Tic Tac Toe app');
      button.hidden = true;
      button.dataset.role = 'install-button';
      mountPoint.appendChild(button);
      installButton = button;
    }

    if (!deferredPromptEvent) {
      installButton.hidden = true;
      installButton.disabled = true;
    }

    if (!installButton.dataset.installBound) {
      installButton.addEventListener('click', handleInstallClick);
      installButton.dataset.installBound = 'true';
    }

    return installButton;
  };

  const handleBeforeInstallPrompt = (event) => {
    event.preventDefault();
    deferredPromptEvent = event;

    if (document.readyState !== 'loading') {
      ensureInstallButton();
      updateButtonState();
    } else {
      document.addEventListener(
        'DOMContentLoaded',
        () => {
          ensureInstallButton();
          updateButtonState();
        },
        { once: true }
      );
    }
  };

  const monitorDisplayMode = () => {
    if (!window.matchMedia) {
      return;
    }
    try {
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      const handler = (event) => {
        if (event.matches) {
          handleAppInstalled();
        }
      };

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handler);
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(handler);
      }
    } catch (error) {
      console.warn('Unable to monitor display mode changes', error);
    }
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);

  monitorDisplayMode();

  document.addEventListener('DOMContentLoaded', () => {
    if (!ensureInstallButton()) {
      return;
    }
    updateButtonState();
  });
})();
