'use strict';

(function (global) {
  function createCellRenderer({ cells, formatPlayerName, playerX }) {
    const deriveBaseLabel = (label) =>
      typeof label === 'string' ? label.replace(/,\s*(empty|x|o|occupied.*)$/i, '') : '';

    const ensureGlyphContainer = (cell) => {
      let glyph = cell.querySelector('.cell__glyph');
      if (!glyph) {
        glyph = document.createElement('span');
        glyph.className = 'cell__glyph';
        glyph.setAttribute('aria-hidden', 'true');
        cell.appendChild(glyph);
      }
      return glyph;
    };

    cells.forEach((cell) => {
      ensureGlyphContainer(cell);
      const ariaLabel = cell.getAttribute('aria-label') || '';
      const normalized = deriveBaseLabel(ariaLabel);
      if (normalized) {
        cell.dataset.baseLabel = normalized;
      } else if (!cell.dataset.baseLabel) {
        cell.dataset.baseLabel = ariaLabel;
      }
    });

    const setCellDisabled = (cell, disabled) => {
      cell.disabled = disabled;
      cell.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    };

    const updateCellAriaLabel = (cell, value) => {
      const baseLabel = cell.dataset.baseLabel || deriveBaseLabel(cell.getAttribute('aria-label'));
      if (baseLabel) {
        if (value) {
          const playerName = formatPlayerName(value);
          cell.setAttribute('aria-label', `${baseLabel}, ${playerName} (${value}) placed`);
        } else {
          cell.setAttribute('aria-label', `${baseLabel}, empty`);
        }
      } else if (value) {
        const playerName = formatPlayerName(value);
        cell.setAttribute('aria-label', `${playerName} (${value}) placed`);
      } else {
        cell.setAttribute('aria-label', 'Empty cell');
      }
    };

    let glyphIdCounter = 0;
    const createGlyphMarkup = (player) => {
      glyphIdCounter += 1;
      const prefix = player === playerX ? 'x' : 'o';
      const strokeId = `cell-glyph-${prefix}-stroke-${glyphIdCounter}`;
      const highlightId = `cell-glyph-${prefix}-highlight-${glyphIdCounter}`;
      if (player === playerX) {
        return `<svg class="cell__icon cell__icon--x" viewBox="0 0 48 48" role="presentation" focusable="false"><defs><linearGradient id="${strokeId}" x1="14%" y1="10%" x2="86%" y2="90%"><stop offset="0%" style="stop-color: var(--cell-x-color-soft);" /><stop offset="55%" style="stop-color: var(--cell-x-color);" /><stop offset="100%" style="stop-color: var(--cell-x-color-strong);" /></linearGradient><linearGradient id="${highlightId}" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" style="stop-color: rgba(255, 255, 255, 0.92);" /><stop offset="100%" style="stop-color: rgba(255, 255, 255, 0);" /></linearGradient></defs><g><path d="M13 13 L35 35" stroke="url(#${strokeId})" stroke-width="6.2" stroke-linecap="round" /><path d="M35 13 L13 35" stroke="url(#${strokeId})" stroke-width="6.2" stroke-linecap="round" /><path d="M13 13 L35 35" stroke="url(#${highlightId})" stroke-width="2.4" stroke-linecap="round" opacity="0.85" /><path d="M35 13 L13 35" stroke="url(#${highlightId})" stroke-width="2.4" stroke-linecap="round" opacity="0.85" /></g></svg>`;
      }

      return `<svg class="cell__icon cell__icon--o" viewBox="0 0 48 48" role="presentation" focusable="false"><defs><linearGradient id="${strokeId}" x1="24%" y1="0%" x2="76%" y2="100%"><stop offset="0%" style="stop-color: var(--cell-o-color-soft);" /><stop offset="55%" style="stop-color: var(--cell-o-color);" /><stop offset="100%" style="stop-color: var(--cell-o-color-strong);" /></linearGradient><linearGradient id="${highlightId}" x1="30%" y1="0%" x2="70%" y2="100%"><stop offset="0%" style="stop-color: rgba(255, 255, 255, 0.9);" /><stop offset="100%" style="stop-color: rgba(255, 255, 255, 0);" /></linearGradient></defs><g><circle cx="24" cy="24" r="11" stroke="url(#${strokeId})" stroke-width="6" fill="none" /><circle cx="24" cy="24" r="11" stroke="url(#${highlightId})" stroke-width="2.6" fill="none" opacity="0.85" /></g></svg>`;
    };

    const clearCell = (cell) => {
      cell.classList.remove('cell--x', 'cell--o', 'cell--winner');
      const glyph = ensureGlyphContainer(cell);
      glyph.innerHTML = '';
      cell.removeAttribute('data-value');
      setCellDisabled(cell, false);
      updateCellAriaLabel(cell, null);
    };

    const setCellValue = (cell, value) => {
      clearCell(cell);
      if (!value) {
        return;
      }
      ensureGlyphContainer(cell).innerHTML = createGlyphMarkup(value);
      cell.setAttribute('data-value', value);
      cell.classList.add(value === playerX ? 'cell--x' : 'cell--o');
      setCellDisabled(cell, true);
      updateCellAriaLabel(cell, value);
    };

    return { setCellDisabled, clearCell, setCellValue };
  }

  const api = { createCellRenderer };
  global.tictactoeCellRenderer = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
