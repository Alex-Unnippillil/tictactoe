(function () {
  const OFFLINE_MESSAGE =
    "You are offline. Game progress is saved locally until you reconnect.";
  const ONLINE_MESSAGE =
    "Connection restored. Online-only features are available again.";

  const onlineHandlers = new Set();
  let isOnline = navigator.onLine;
  let banner = null;
  let messageElement = null;
  let dismissButton = null;
  let userDismissed = false;
  let hasInitialised = false;

  const setDocumentNetworkState = () => {
    const root = document.documentElement;
    if (root) {
      root.setAttribute("data-network-state", isOnline ? "online" : "offline");
    }
  };

  const dispatchStatusEvent = () => {
    document.dispatchEvent(
      new CustomEvent("app:network-status", {
        detail: { online: isOnline },
      })
    );
  };

  const runOnlineHandlers = () => {
    onlineHandlers.forEach((handler) => {
      try {
        handler();
      } catch (error) {
        console.error("Error running online handler", error);
      }
    });
  };

  const hideBanner = () => {
    if (!banner) {
      return;
    }
    banner.hidden = true;
    banner.setAttribute("aria-hidden", "true");
  };

  const showBanner = ({ focus = false } = {}) => {
    if (!banner || userDismissed) {
      return;
    }
    banner.hidden = false;
    banner.setAttribute("aria-hidden", "false");
    if (focus) {
      requestAnimationFrame(() => {
        try {
          banner.focus();
        } catch (error) {
          console.warn("Unable to focus offline banner", error);
        }
      });
    }
  };

  const updateBannerVisibility = ({ focus = false } = {}) => {
    if (!banner) {
      return;
    }

    if (!isOnline && !userDismissed) {
      showBanner({ focus });
    } else {
      hideBanner();
    }
  };

  const setMessage = (text) => {
    if (messageElement) {
      messageElement.textContent = text;
    }
  };

  const setOnlineState = (nextState, options = {}) => {
    const focus = Boolean(options.focus);
    const previousState = isOnline;
    isOnline = Boolean(nextState);

    if (isOnline) {
      if (!previousState) {
        userDismissed = false;
      }
      updateBannerVisibility({ focus: false });
      if (!previousState) {
        runOnlineHandlers();
      }
    } else {
      if (previousState) {
        userDismissed = false;
      }
      updateBannerVisibility({ focus });
    }

    setDocumentNetworkState();
    if (previousState !== isOnline) {
      dispatchStatusEvent();
    }
  };

  const handleDismiss = (event) => {
    if (event) {
      event.preventDefault();
    }
    userDismissed = true;
    hideBanner();
    if (dismissButton) {
      dismissButton.blur();
    }
  };

  const handleOnline = () => {
    setMessage(ONLINE_MESSAGE);
    setOnlineState(true);
  };

  const handleOffline = () => {
    setMessage(OFFLINE_MESSAGE);
    setOnlineState(false, { focus: hasInitialised });
  };

  document.addEventListener("DOMContentLoaded", () => {
    banner = document.getElementById("connectionBanner");
    messageElement = document.getElementById("connectionBannerMessage");
    dismissButton = document.getElementById("connectionBannerDismiss");

    if (banner) {
      banner.setAttribute("aria-hidden", banner.hidden ? "true" : "false");
    }

    if (dismissButton) {
      dismissButton.addEventListener("click", handleDismiss);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setDocumentNetworkState();
    if (isOnline) {
      setMessage(ONLINE_MESSAGE);
      hideBanner();
      runOnlineHandlers();
    } else {
      setMessage(OFFLINE_MESSAGE);
      updateBannerVisibility({ focus: false });
    }
    dispatchStatusEvent();
    hasInitialised = true;
  });

  window.appNetwork = {
    isOnline: () => isOnline,
    onOnline(handler, options = {}) {
      if (typeof handler !== "function") {
        return () => {};
      }

      const immediate = options.immediate !== false;
      onlineHandlers.add(handler);

      if (isOnline && immediate) {
        try {
          handler();
        } catch (error) {
          console.error("Error running online handler", error);
        }
      }

      return () => {
        onlineHandlers.delete(handler);
      };
    },
  };
})();
