const DEFAULT_MIN_DELAY = 200;
const DEFAULT_MAX_DELAY = 400;
const DEFAULT_MESSAGE = 'AI is thinking…';

/**
 * Manages delayed UI feedback when the AI is processing a move.
 *
 * The feedback is rendered only if the AI is still working after a
 * configurable delay. Pending feedback can be cancelled to avoid showing
 * stale messages when the game state changes.
 */
export class ThinkingFeedback {
  /**
   * @param {HTMLElement} container - Element that will host the feedback UI.
   * @param {Object} [options]
   * @param {number} [options.minDelay]
   * @param {number} [options.maxDelay]
   * @param {string} [options.message]
   */
  constructor(
    container,
    { minDelay = DEFAULT_MIN_DELAY, maxDelay = DEFAULT_MAX_DELAY, message = DEFAULT_MESSAGE } = {}
  ) {
    this._container = container;
    this._minDelay = Math.max(0, minDelay);
    this._maxDelay = Math.max(this._minDelay, maxDelay);
    this._message = message;

    this._showTimeoutId = null;
    this._isVisible = false;

    if (this._container) {
      this._container.setAttribute('aria-busy', 'false');
    }
  }

  /**
   * Starts the delayed feedback. If feedback is already pending or visible,
   * this is a no-op.
   */
  show() {
    if (!this._container) {
      return;
    }

    if (this._showTimeoutId !== null || this._isVisible) {
      return;
    }

    const delay = this._randomDelay();
    this._showTimeoutId = window.setTimeout(() => {
      this._showTimeoutId = null;
      this._render();
    }, delay);
  }

  /**
   * Hides the feedback immediately and clears any pending timers.
   */
  hide() {
    if (!this._container) {
      return;
    }

    if (this._showTimeoutId !== null) {
      window.clearTimeout(this._showTimeoutId);
      this._showTimeoutId = null;
    }

    if (!this._isVisible) {
      return;
    }

    this._container.innerHTML = '';
    this._container.classList.remove('is-visible');
    this._container.setAttribute('aria-busy', 'false');
    this._isVisible = false;
  }

  /**
   * Cancels pending feedback and removes any visible UI.
   */
  cancel() {
    this.hide();
  }

  /**
   * Returns whether the feedback is currently visible.
   * @returns {boolean}
   */
  get isVisible() {
    return this._isVisible;
  }

  _render() {
    if (!this._container) {
      return;
    }

    this._container.innerHTML = `
      <span class="spinner" aria-hidden="true"></span>
      <span class="feedback-text">${this._message}</span>
    `;
    this._container.classList.add('is-visible');
    this._container.setAttribute('aria-busy', 'true');
    this._isVisible = true;
  }

  _randomDelay() {
    if (this._minDelay === this._maxDelay) {
      return this._minDelay;
    }

    const range = this._maxDelay - this._minDelay;
    return this._minDelay + Math.floor(Math.random() * (range + 1));
  }
}

export default ThinkingFeedback;
