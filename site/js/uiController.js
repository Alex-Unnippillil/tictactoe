const getKey = (event) => event.key?.toLowerCase?.() || '';

export function createUIController({ onCellClick, onUndo, onRedo }) {
  const boardElement = document.querySelector('.board');
  const messageElement = document.querySelector('.message');
  const turnElement = document.querySelector('.turn');
  const undoButton = document.querySelector('[data-action="undo"]');
  const redoButton = document.querySelector('[data-action="redo"]');

  Array.from(boardElement.rows).forEach((rowElement, rowIndex) => {
    Array.from(rowElement.cells).forEach((cellElement, colIndex) => {
      cellElement.dataset.row = rowIndex;
      cellElement.dataset.col = colIndex;
      cellElement.addEventListener('click', () => {
        if (typeof onCellClick === 'function') {
          onCellClick(rowIndex, colIndex);
        }
      });
    });
  });

  undoButton.addEventListener('click', () => {
    if (!undoButton.disabled && typeof onUndo === 'function') {
      onUndo();
    }
  });

  redoButton.addEventListener('click', () => {
    if (!redoButton.disabled && typeof onRedo === 'function') {
      onRedo();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!(event.ctrlKey || event.metaKey)) {
      return;
    }

    const key = getKey(event);
    if (key === 'z' && !undoButton.disabled) {
      event.preventDefault();
      if (typeof onUndo === 'function') {
        onUndo();
      }
      return;
    }

    if ((key === 'y' || (key === 'z' && event.shiftKey)) && !redoButton.disabled) {
      event.preventDefault();
      if (typeof onRedo === 'function') {
        onRedo();
      }
    }
  });

  return {
    renderBoard(board) {
      Array.from(boardElement.rows).forEach((rowElement, rowIndex) => {
        Array.from(rowElement.cells).forEach((cellElement, colIndex) => {
          cellElement.textContent = board[rowIndex][colIndex];
        });
      });
    },

    setMessage(text) {
      messageElement.textContent = text;
    },

    setTurn(text) {
      turnElement.textContent = text;
    },

    setUndoEnabled(enabled) {
      undoButton.disabled = !enabled;
    },

    setRedoEnabled(enabled) {
      redoButton.disabled = !enabled;
    },
  };
}
