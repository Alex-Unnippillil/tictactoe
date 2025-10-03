const ACTIVATION_KEYS = new Set(['Enter', ' ', 'Spacebar']);
const ARROW_KEYS = new Map([
  ['ArrowUp', { row: -1, col: 0 }],
  ['ArrowDown', { row: 1, col: 0 }],
  ['ArrowLeft', { row: 0, col: -1 }],
  ['ArrowRight', { row: 0, col: 1 }]
]);

/**
 * Enables keyboard navigation for the tic tac toe board and provides an
 * activation callback for triggering moves with the keyboard.
 *
 * @param {HTMLElement} boardElement - The root element of the grid.
 * @param {(cell: HTMLElement) => void} onActivate - Called when the user presses
 *   Enter or Space while a cell is focused.
 * @returns {{ setActiveCell(cell: HTMLElement): void, focusCell(cell: HTMLElement): void }}
 */
export function initBoardKeyboardNavigation(boardElement, onActivate) {
  const cells = Array.from(boardElement.querySelectorAll('[data-cell]'));
  if (!cells.length) {
    throw new Error('Keyboard navigation requires at least one cell.');
  }

  const matrix = buildMatrix(cells);
  let activeCell = null;

  cells.forEach((cell, index) => {
    cell.setAttribute('tabindex', index === 0 ? '0' : '-1');
    cell.addEventListener('keydown', handleKeyDown);
    cell.addEventListener('focus', () => setActiveCell(cell));
  });

  activeCell = cells[0];

  function handleKeyDown(event) {
    if (ARROW_KEYS.has(event.key)) {
      event.preventDefault();
      const delta = ARROW_KEYS.get(event.key);
      moveFocus(event.currentTarget, delta.row, delta.col);
      return;
    }

    if (ACTIVATION_KEYS.has(event.key)) {
      event.preventDefault();
      onActivate(event.currentTarget);
    }
  }

  function moveFocus(cell, deltaRow, deltaCol) {
    const currentRow = Number(cell.dataset.row);
    const currentCol = Number(cell.dataset.col);
    const nextRow = clamp(currentRow + deltaRow, 0, matrix.length - 1);
    const nextCol = clamp(currentCol + deltaCol, 0, matrix[0].length - 1);

    const nextCell = matrix[nextRow][nextCol];
    if (nextCell && nextCell !== cell) {
      focusCell(nextCell);
    }
  }

  function focusCell(cell) {
    setActiveCell(cell);
    cell.focus();
  }

  function setActiveCell(cell) {
    if (!cell) {
      return;
    }

    if (activeCell && activeCell !== cell) {
      activeCell.setAttribute('tabindex', '-1');
    }

    activeCell = cell;
    activeCell.setAttribute('tabindex', '0');
  }

  return {
    setActiveCell,
    focusCell,
  };
}

function buildMatrix(cells) {
  const matrix = [];

  cells.forEach((cell) => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    if (!matrix[row]) {
      matrix[row] = [];
    }

    matrix[row][col] = cell;
  });

  return matrix;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
