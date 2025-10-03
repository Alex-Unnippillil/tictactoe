const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function isEmptyValue(value) {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  return false;
}

function toCellList(board) {
  if (!Array.isArray(board)) {
    return [];
  }

  const isMatrix = board.every((item) => Array.isArray(item));
  const cells = [];

  if (isMatrix) {
    const inferredWidth = board.reduce((max, row) => {
      if (!Array.isArray(row)) {
        return max;
      }
      return Math.max(max, row.length);
    }, 0);
    const width = inferredWidth > 0 ? inferredWidth : board.length;

    for (let row = 0; row < board.length; row += 1) {
      const currentRow = board[row];
      if (!Array.isArray(currentRow)) {
        continue;
      }
      for (let col = 0; col < currentRow.length; col += 1) {
        cells.push({
          index: row * width + col,
          row,
          col,
          value: currentRow[col],
        });
      }
    }
  } else {
    const dimension = Math.sqrt(board.length);
    const width = Number.isInteger(dimension) && dimension > 0
      ? dimension
      : (board.length > 0 ? board.length : 3);

    for (let index = 0; index < board.length; index += 1) {
      cells.push({
        index,
        row: Math.floor(index / width),
        col: index % width,
        value: board[index],
      });
    }
  }

  return cells;
}

export function getWinner(board) {
  const cells = toCellList(board);
  if (cells.length < 9) {
    return null;
  }

  const maxIndex = cells.reduce((max, cell) => Math.max(max, cell.index), -1);
  const values = Array.from({ length: Math.max(maxIndex + 1, 9) }, () => undefined);
  cells.forEach((cell) => {
    values[cell.index] = cell.value;
  });

  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const first = values[a];

    if (isEmptyValue(first)) {
      continue;
    }

    if (first === values[b] && first === values[c]) {
      return { player: first, line: [...line] };
    }
  }

  return null;
}

export function availableMoves(board) {
  return toCellList(board)
    .filter((cell) => isEmptyValue(cell.value))
    .map((cell) => ({ index: cell.index, row: cell.row, col: cell.col }));
}

export function isDraw(board) {
  const cells = toCellList(board);

  if (cells.length < 9) {
    return false;
  }

  if (getWinner(board)) {
    return false;
  }

  return cells.every((cell) => !isEmptyValue(cell.value));
}

export const __testables__ = {
  WINNING_LINES,
  toCellList,
  isEmptyValue,
};
