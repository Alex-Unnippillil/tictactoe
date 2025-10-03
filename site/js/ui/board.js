(function (global) {
  const getStateApi = () => global?.coreState;

  document.addEventListener("DOMContentLoaded", () => {
    const state = getStateApi();
    if (!state) {
      return;
    }

    const board = document.querySelector('[data-testid="board"]');
    if (!board) {
      return;
    }

    const cells = board.querySelectorAll('[data-index]');
    cells.forEach((cell) => {
      const index = Number.parseInt(cell.getAttribute("data-index"), 10);
      if (!Number.isInteger(index)) {
        return;
      }

      const { row, column } = state.indexToCoords(index);
      cell.setAttribute("data-row", String(row));
      cell.setAttribute("data-column", String(column));

      if (!cell.hasAttribute("role")) {
        cell.setAttribute("role", "gridcell");
      }
      if (!cell.hasAttribute("tabindex")) {
        cell.setAttribute("tabindex", "0");
      }
      if (!cell.hasAttribute("aria-label")) {
        cell.setAttribute(
          "aria-label",
          `Row ${row + 1}, column ${column + 1}`
        );
      }
    });
  });
})(typeof window !== "undefined" ? window : globalThis);
