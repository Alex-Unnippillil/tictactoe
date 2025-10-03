(function () {
  const installButton = document.querySelector('[data-install-button]');
  if (!installButton) {
    return;
  }

  let deferredPrompt = null;

  const hideInstallButton = () => {
    installButton.classList.remove('is-visible');
    installButton.setAttribute('aria-hidden', 'true');
    installButton.disabled = false;
  };

  const showInstallButton = () => {
    installButton.classList.add('is-visible');
    installButton.removeAttribute('aria-hidden');
    installButton.disabled = false;
  };

  hideInstallButton();

  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) {
      return;
    }

    installButton.disabled = true;

    deferredPrompt.prompt();

    try {
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        hideInstallButton();
      }
    } catch (error) {
      console.warn('PWA installation prompt was not completed.', error);
    } finally {
      deferredPrompt = null;
      installButton.disabled = false;
      hideInstallButton();
    }
  });

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideInstallButton();
  });
})();
