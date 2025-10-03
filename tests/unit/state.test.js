const test = require("node:test");
const assert = require("node:assert/strict");

const state = require("../../site/js/core/state.js");

const expectedIndexGrid = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];

test("coordsToIndex follows a 0-8 row-major mapping", () => {
  expectedIndexGrid.forEach((rowIndices, row) => {
    rowIndices.forEach((expectedIndex, column) => {
      assert.equal(
        state.coordsToIndex(row, column),
        expectedIndex,
        `Expected (${row}, ${column}) to map to index ${expectedIndex}`
      );
    });
  });
});

test("indexToCoords returns the original row and column", () => {
  expectedIndexGrid.flat().forEach((index) => {
    const { row, column } = state.indexToCoords(index);
    assert.equal(
      expectedIndexGrid[row][column],
      index,
      `Index ${index} should map back to row ${row}, column ${column}`
    );
  });
});

test("indexToCoords and coordsToIndex are inverses for every cell", () => {
  state.BOARD_INDEX_SEQUENCE.forEach((index) => {
    const { row, column } = state.indexToCoords(index);
    assert.equal(state.coordsToIndex(row, column), index);
  });
});
