const LIVE_REGION_ID = 'game-status-announcer';
let liveRegion;
let rafId = null;

function getLiveRegion() {
  if (!liveRegion) {
    liveRegion = document.getElementById(LIVE_REGION_ID) || null;
  }

  return liveRegion;
}

function cancelPendingUpdate() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function setLiveRegionMessage(message) {
  const region = getLiveRegion();

  if (!region) {
    return;
  }

  cancelPendingUpdate();

  const newMessage = message ?? '';

  if (region.textContent === newMessage) {
    region.textContent = '';
    rafId = requestAnimationFrame(() => {
      region.textContent = newMessage;
      rafId = null;
    });
  } else {
    region.textContent = newMessage;
  }
}

export function announceTurn(player) {
  if (!player) {
    return;
  }

  setLiveRegionMessage(`Player ${player}'s turn.`);
}

export function announceError(message) {
  if (!message) {
    return;
  }

  setLiveRegionMessage(message);
}

export function announceResult(message) {
  if (!message) {
    return;
  }

  setLiveRegionMessage(message);
}

export function clearAnnouncement() {
  setLiveRegionMessage('');
}
