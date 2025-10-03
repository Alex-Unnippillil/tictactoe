const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => {
    if (element.hasAttribute('hidden')) {
      return false;
    }

    if (element.getAttribute('aria-hidden') === 'true') {
      return false;
    }

    const { width, height } = element.getBoundingClientRect();
    return width > 0 || height > 0;
  });
}

export class Modal {
  constructor(root) {
    if (!root) {
      throw new Error('A modal root element is required.');
    }

    this.root = root;
    this.dialog = root.querySelector('[data-modal-dialog]') || root;
    this.overlay = root.querySelector('[data-modal-overlay]');
    this.closeButtons = Array.from(root.querySelectorAll('[data-modal-close]'));
    this.isOpen = false;
    this.lastFocusedElement = null;
    this.focusableElements = [];

    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleFocusIn = this.handleFocusIn.bind(this);
    this.handleTriggerClick = this.handleTriggerClick.bind(this);

    this.setupAccessibility();
    this.attachStaticListeners();
  }

  setupAccessibility() {
    if (!this.dialog.hasAttribute('role')) {
      this.dialog.setAttribute('role', 'dialog');
    }

    if (!this.dialog.hasAttribute('aria-modal')) {
      this.dialog.setAttribute('aria-modal', 'true');
    }

    if (!this.dialog.hasAttribute('tabindex')) {
      this.dialog.setAttribute('tabindex', '-1');
    }

    this.root.setAttribute('aria-hidden', 'true');
  }

  attachStaticListeners() {
    this.closeButtons.forEach((button) => {
      button.addEventListener('click', () => this.close());
    });

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
  }

  registerTrigger(trigger) {
    trigger.addEventListener('click', this.handleTriggerClick);
  }

  handleTriggerClick(event) {
    event.preventDefault();
    const trigger = event.currentTarget;
    this.open(trigger);
  }

  open(trigger = null) {
    if (this.isOpen) {
      return;
    }

    this.isOpen = true;
    this.lastFocusedElement = trigger || document.activeElement;
    this.root.classList.add('modal--visible');
    this.root.setAttribute('aria-hidden', 'false');

    this.focusableElements = getFocusableElements(this.dialog);
    document.addEventListener('keydown', this.handleKeydown, true);
    document.addEventListener('focusin', this.handleFocusIn, true);

    requestAnimationFrame(() => {
      const elementToFocus = this.focusableElements[0] || this.dialog;
      if (elementToFocus && typeof elementToFocus.focus === 'function') {
        elementToFocus.focus({ preventScroll: true });
      }
    });
  }

  close() {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.root.classList.remove('modal--visible');
    this.root.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', this.handleKeydown, true);
    document.removeEventListener('focusin', this.handleFocusIn, true);

    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      this.lastFocusedElement.focus({ preventScroll: true });
    }

    this.lastFocusedElement = null;
  }

  handleKeydown(event) {
    if (!this.isOpen) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    this.focusableElements = getFocusableElements(this.dialog);
    if (this.focusableElements.length === 0) {
      event.preventDefault();
      this.dialog.focus({ preventScroll: true });
      return;
    }

    const { activeElement } = document;
    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey) {
      if (activeElement === firstElement || !this.dialog.contains(activeElement)) {
        event.preventDefault();
        if (lastElement && typeof lastElement.focus === 'function') {
          lastElement.focus({ preventScroll: true });
        }
      }
    } else if (activeElement === lastElement) {
      event.preventDefault();
      if (firstElement && typeof firstElement.focus === 'function') {
        firstElement.focus({ preventScroll: true });
      }
    }
  }

  handleFocusIn(event) {
    if (!this.isOpen) {
      return;
    }

    if (!this.root.contains(event.target)) {
      const fallback = this.focusableElements[0] || this.dialog;
      if (fallback && typeof fallback.focus === 'function') {
        fallback.focus({ preventScroll: true });
      }
    }
  }
}

export function initModals(selector = '[data-modal]') {
  const modalElements = Array.from(document.querySelectorAll(selector));
  const modals = new Map();

  modalElements.forEach((element) => {
    const modal = new Modal(element);
    modals.set(element.id || element, modal);
  });

  const triggers = Array.from(document.querySelectorAll('[data-modal-trigger]'));
  triggers.forEach((trigger) => {
    const targetId = trigger.getAttribute('data-modal-trigger');
    if (!targetId) {
      return;
    }

    const modalElement = document.getElementById(targetId);
    if (!modalElement) {
      return;
    }

    const modalInstance = modals.get(modalElement.id);
    if (modalInstance) {
      modalInstance.registerTrigger(trigger);
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-controls', modalElement.id);
    }
  });

  return modals;
}
