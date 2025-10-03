const BOARD_SIZE = 3;

const createInitialState = () => ({
  currentPlayer: 'X',
  board: Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill('')),
  gameOver: false,
});

const checkWin = (board, player) => {
  for (let i = 0; i < BOARD_SIZE; i += 1) {
    const hasRowWin = board[i][0] === player && board[i][1] === player && board[i][2] === player;
    const hasColumnWin = board[0][i] === player && board[1][i] === player && board[2][i] === player;

    if (hasRowWin || hasColumnWin) {
      return true;
    }
  }

  const hasPrimaryDiagonalWin = board[0][0] === player && board[1][1] === player && board[2][2] === player;
  const hasSecondaryDiagonalWin = board[0][2] === player && board[1][1] === player && board[2][0] === player;

  return hasPrimaryDiagonalWin || hasSecondaryDiagonalWin;
};

const checkDraw = (board) => board.every((row) => row.every((cell) => cell !== ''));

export function initUI({ root }) {
  if (!root) {
    throw new Error('initUI requires a root element');
  }

  const state = createInitialState();

  const boardEl = document.createElement('table');
  boardEl.className = 'board';

  const statusEl = document.createElement('div');
  statusEl.className = 'message';
  statusEl.textContent = `Current Player: ${state.currentPlayer}`;

  const cells = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE));

  const endGame = (message) => {
    state.gameOver = true;
    statusEl.textContent = message;
  };

  const handleMove = (row, col) => {
    if (state.gameOver || state.board[row][col] !== '') {
      return;
    }

    state.board[row][col] = state.currentPlayer;
    cells[row][col].textContent = state.currentPlayer;

    if (checkWin(state.board, state.currentPlayer)) {
      endGame(`${state.currentPlayer} Wins!`);
      return;
    }

    if (checkDraw(state.board)) {
      endGame("It's a draw!");
      return;
    }

    state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
    statusEl.textContent = `Current Player: ${state.currentPlayer}`;
  };

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    const tr = document.createElement('tr');

    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const td = document.createElement('td');
      td.addEventListener('click', () => handleMove(row, col));
      tr.appendChild(td);
      cells[row][col] = td;
    }

    boardEl.appendChild(tr);
  }

  root.innerHTML = '';
  root.appendChild(boardEl);
  root.appendChild(statusEl);
}
