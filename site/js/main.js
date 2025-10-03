import { History } from './core/history.js';
import { createUIController } from './uiController.js';

const createInitialState = () => ({
  board: Array.from({ length: 3 }, () => Array(3).fill('')),
  currentPlayer: 'X',
  message: '',
  gameOver: false,
});

const cloneBoard = (board) => board.map((row) => row.slice());

const calculateMessage = (state) => state.message || '';

const checkWin = (board, player) => {
  for (let i = 0; i < 3; i += 1) {
    if (board[i][0] === player && board[i][1] === player && board[i][2] === player) {
      return true;
    }

    if (board[0][i] === player && board[1][i] === player && board[2][i] === player) {
      return true;
    }
  }

  if (board[0][0] === player && board[1][1] === player && board[2][2] === player) {
    return true;
  }

  if (board[0][2] === player && board[1][1] === player && board[2][0] === player) {
    return true;
  }

  return false;
};

const checkDraw = (board) => board.every((row) => row.every((cell) => cell !== ''));

document.addEventListener('DOMContentLoaded', () => {
  const ui = createUIController({
    onCellClick: handleCellClick,
    onUndo: handleUndo,
    onRedo: handleRedo,
  });

  const initialState = createInitialState();
  const history = new History(initialState);
  let state = initialState;

  function syncUI() {
    ui.renderBoard(state.board);
    ui.setMessage(calculateMessage(state));
    ui.setTurn(state.gameOver ? '' : `Current Player: ${state.currentPlayer}`);
    ui.setUndoEnabled(history.canUndo());
    ui.setRedoEnabled(history.canRedo());
  }

  function applyState(newState, { record = false } = {}) {
    state = {
      board: cloneBoard(newState.board),
      currentPlayer: newState.currentPlayer,
      message: newState.message,
      gameOver: newState.gameOver,
    };

    if (record) {
      history.push(state);
    }

    syncUI();
  }

  function handleCellClick(row, col) {
    if (state.gameOver || state.board[row][col] !== '') {
      return;
    }

    const board = cloneBoard(state.board);
    board[row][col] = state.currentPlayer;

    let nextPlayer = state.currentPlayer;
    let message = '';
    let gameOver = false;

    if (checkWin(board, state.currentPlayer)) {
      message = `${state.currentPlayer} Wins!`;
      gameOver = true;
    } else if (checkDraw(board)) {
      message = "It's a draw!";
      gameOver = true;
    } else {
      nextPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
    }

    applyState(
      {
        board,
        currentPlayer: nextPlayer,
        message,
        gameOver,
      },
      { record: true },
    );
  }

  function handleUndo() {
    if (!history.canUndo()) {
      return;
    }

    state = history.undo();
    syncUI();
  }

  function handleRedo() {
    if (!history.canRedo()) {
      return;
    }

    state = history.redo();
    syncUI();
  }

  syncUI();
});
