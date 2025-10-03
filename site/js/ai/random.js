export function aiRandom(state) {
  if (!state || !Array.isArray(state.board)) {
    throw new Error('aiRandom requires a state object with a board property.');
  }

  const availableMoves = [];

  for (let row = 0; row < state.board.length; row += 1) {
    for (let col = 0; col < state.board[row].length; col += 1) {
      if (state.board[row][col] === '') {
        availableMoves.push({ row, col });
      }
    }
  }

  if (availableMoves.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
}
