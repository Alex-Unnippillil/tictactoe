export const DIFFICULTIES = Object.freeze({
  HUMAN: "human",
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
});

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

export function isAIMode(mode) {
  return mode !== DIFFICULTIES.HUMAN;
}

export function chooseMove(board, aiPlayer, difficulty) {
  const opponent = aiPlayer === "X" ? "O" : "X";
  const emptySquares = availableMoves(board);

  if (!emptySquares.length) {
    return null;
  }

  switch (difficulty) {
    case DIFFICULTIES.EASY:
      return easyMove(emptySquares);
    case DIFFICULTIES.MEDIUM:
      return mediumMove(board, aiPlayer, opponent, emptySquares);
    case DIFFICULTIES.HARD:
      return hardMove(board, aiPlayer, opponent);
    default:
      return null;
  }
}

function easyMove(moves) {
  const index = Math.floor(Math.random() * moves.length);
  return moves[index];
}

function mediumMove(board, aiPlayer, opponent, moves) {
  // Try to win
  for (const move of moves) {
    const simulated = board.slice();
    simulated[move] = aiPlayer;
    if (checkWinner(simulated) === aiPlayer) {
      return move;
    }
  }

  // Block opponent win
  for (const move of moves) {
    const simulated = board.slice();
    simulated[move] = opponent;
    if (checkWinner(simulated) === opponent) {
      return move;
    }
  }

  return easyMove(moves);
}

function hardMove(board, aiPlayer, opponent) {
  let bestScore = -Infinity;
  let bestMove = null;

  for (const move of availableMoves(board)) {
    const simulated = board.slice();
    simulated[move] = aiPlayer;
    const score = minimax(simulated, false, aiPlayer, opponent, 0);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(board, isMaximizing, aiPlayer, opponent, depth) {
  const winner = checkWinner(board);
  if (winner === aiPlayer) {
    return 10 - depth;
  }
  if (winner === opponent) {
    return depth - 10;
  }
  if (availableMoves(board).length === 0) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of availableMoves(board)) {
      const simulated = board.slice();
      simulated[move] = aiPlayer;
      const score = minimax(simulated, false, aiPlayer, opponent, depth + 1);
      bestScore = Math.max(bestScore, score);
    }
    return bestScore;
  }

  let bestScore = Infinity;
  for (const move of availableMoves(board)) {
    const simulated = board.slice();
    simulated[move] = opponent;
    const score = minimax(simulated, true, aiPlayer, opponent, depth + 1);
    bestScore = Math.min(bestScore, score);
  }
  return bestScore;
}

export function checkWinner(board) {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export function isDraw(board) {
  return availableMoves(board).length === 0 && !checkWinner(board);
}

export function availableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i += 1) {
    if (!board[i]) {
      moves.push(i);
    }
  }
  return moves;
}
