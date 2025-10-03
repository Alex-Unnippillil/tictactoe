const cloneBoard = (board) => board.map((row) => row.slice());

const cloneState = (state) => ({
  board: cloneBoard(state.board),
  currentPlayer: state.currentPlayer,
  message: state.message,
  gameOver: state.gameOver,
});

export class History {
  constructor(initialState) {
    this._states = [];
    this._index = -1;
    if (initialState) {
      this.reset(initialState);
    }
  }

  push(state) {
    const snapshot = cloneState(state);
    if (this._index < this._states.length - 1) {
      this._states.splice(this._index + 1);
    }
    this._states.push(snapshot);
    this._index = this._states.length - 1;
    return this.current();
  }

  undo() {
    if (!this.canUndo()) {
      return this.current();
    }
    this._index -= 1;
    return this.current();
  }

  redo() {
    if (!this.canRedo()) {
      return this.current();
    }
    this._index += 1;
    return this.current();
  }

  current() {
    if (this._index === -1) {
      return null;
    }
    return cloneState(this._states[this._index]);
  }

  canUndo() {
    return this._index > 0;
  }

  canRedo() {
    return this._index >= 0 && this._index < this._states.length - 1;
  }

  reset(initialState) {
    this._states = [cloneState(initialState)];
    this._index = 0;
  }
}

export const __testUtils = {
  cloneState,
};
