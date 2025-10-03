import { DIFFICULTIES } from "../game/ai.js";

let currentMode = DIFFICULTIES.HUMAN;
let modeVersion = 0;
const subscribers = new Set();

export function initSettings({ root = document, onModeChange, onReset } = {}) {
  const modeInputs = root.querySelectorAll('input[name="mode"]');
  modeInputs.forEach((input) => {
    input.addEventListener("change", (event) => {
      if (event.target.checked) {
        setMode(event.target.value);
        onModeChange?.(currentMode);
      }
    });
  });

  const resetButton = root.querySelector("[data-reset]");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      onReset?.();
    });
  }
}

export function subscribeModeChange(listener) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

export function getCurrentMode() {
  return currentMode;
}

export function getModeVersion() {
  return modeVersion;
}

export function setMode(nextMode) {
  if (!Object.values(DIFFICULTIES).includes(nextMode)) {
    return;
  }

  if (currentMode === nextMode) {
    return;
  }

  currentMode = nextMode;
  modeVersion += 1;
  subscribers.forEach((listener) => listener(currentMode, modeVersion));
}

export function forceModeSync(mode) {
  currentMode = mode;
}
