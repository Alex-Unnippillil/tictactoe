(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    var banner = document.getElementById('offline-banner');
    if (!banner) {
      return;
    }

    var body = document.body;
    if (body) {
      body.classList.add('has-offline-banner');
    }

    var offlineMessage = banner.getAttribute('data-offline-message') ||
      "You're playing offline. Gameplay works locally until connection returns.";
    var onlineMessage = banner.getAttribute('data-online-message') ||
      "You're back online!";
    var hideTimer = null;

    function hideBanner() {
      banner.classList.remove('is-visible');
      banner.classList.remove('is-online');
      banner.classList.remove('is-offline');
    }

    function showOffline() {
      clearTimeout(hideTimer);
      banner.textContent = offlineMessage;
      banner.classList.remove('is-online');
      banner.classList.add('is-offline', 'is-visible');
    }

    function showOnline() {
      clearTimeout(hideTimer);
      banner.textContent = onlineMessage;
      banner.classList.remove('is-offline');
      banner.classList.add('is-online', 'is-visible');
      hideTimer = window.setTimeout(function () {
        banner.classList.remove('is-visible');
        banner.classList.remove('is-online');
      }, 2500);
    }

    function updateStatus() {
      if (navigator.onLine) {
        hideTimer = window.setTimeout(hideBanner, 10);
      } else {
        showOffline();
      }
    }

    window.addEventListener('online', function () {
      showOnline();
    });

    window.addEventListener('offline', function () {
      showOffline();
    });

    if (typeof navigator.onLine === 'boolean') {
      if (navigator.onLine) {
        hideBanner();
      } else {
        showOffline();
      }
    } else {
      updateStatus();
    }
  });
})();
