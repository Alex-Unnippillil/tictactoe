(function (global) {
  const BOARD_SIZE = 3;
  const BOARD_CELL_COUNT = BOARD_SIZE * BOARD_SIZE;

  /**
   * The board is represented as a flat array of nine cells in row-major order.
   *
   * Index reference:
   *   0 | 1 | 2
   *   3 | 4 | 5
   *   6 | 7 | 8
   *
   * The value at each index describes the state of that cell: "X", "O", or null.
   */
  const BOARD_INDEX_SEQUENCE = Object.freeze(
    Array.from({ length: BOARD_CELL_COUNT }, (_, index) => index)
  );

  const BOARD_COORDINATES = Object.freeze(
    BOARD_INDEX_SEQUENCE.map((index) =>
      Object.freeze({
        index,
        row: Math.floor(index / BOARD_SIZE),
        column: index % BOARD_SIZE,
      })
    )
  );

  const isInteger = (value) => Number.isInteger(value);

  const assertValidIndex = (index) => {
    if (!isInteger(index) || index < 0 || index >= BOARD_CELL_COUNT) {
      throw new RangeError(
        `Board index must be an integer between 0 and ${BOARD_CELL_COUNT - 1}, received ${index}.`
      );
    }
  };

  const assertValidCoordinates = (row, column) => {
    if (!isInteger(row) || row < 0 || row >= BOARD_SIZE) {
      throw new RangeError(
        `Row coordinate must be an integer between 0 and ${BOARD_SIZE - 1}, received ${row}.`
      );
    }
    if (!isInteger(column) || column < 0 || column >= BOARD_SIZE) {
      throw new RangeError(
        `Column coordinate must be an integer between 0 and ${BOARD_SIZE - 1}, received ${column}.`
      );
    }
  };

  const indexToCoords = (index) => {
    assertValidIndex(index);
    return {
      row: Math.floor(index / BOARD_SIZE),
      column: index % BOARD_SIZE,
    };
  };

  const coordsToIndex = (row, column) => {
    assertValidCoordinates(row, column);
    return row * BOARD_SIZE + column;
  };

  const createEmptyBoard = () => Array(BOARD_CELL_COUNT).fill(null);

  const cloneBoard = (board) => {
    if (!Array.isArray(board) || board.length !== BOARD_CELL_COUNT) {
      throw new TypeError(
        "Board must be a flat array of nine cells when cloning the state."
      );
    }
    return board.slice();
  };

  const api = Object.freeze({
    BOARD_SIZE,
    BOARD_CELL_COUNT,
    BOARD_INDEX_SEQUENCE,
    BOARD_COORDINATES,
    indexToCoords,
    coordsToIndex,
    createEmptyBoard,
    cloneBoard,
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (global && !global.coreState) {
    Object.defineProperty(global, "coreState", {
      value: api,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
