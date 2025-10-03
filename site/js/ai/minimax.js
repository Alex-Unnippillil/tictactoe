const CENTER = { row: 1, col: 1 };
const CORNERS = [
  { row: 0, col: 0 },
  { row: 0, col: 2 },
  { row: 2, col: 0 },
  { row: 2, col: 2 }
];
const SIDES = [
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 1, col: 2 },
  { row: 2, col: 1 }
];

function isEmptyCell(value) {
  return value === null || value === undefined || value === '' || value === ' ';
}

function cloneBoard(board) {
  return board.map((row) => row.slice());
}

function countMoves(board, token) {
  return board.reduce(
    (count, row) =>
      count + row.reduce((rowCount, cell) => rowCount + (cell === token ? 1 : 0), 0),
    0
  );
}

function getAvailableMoves(board) {
  const moves = [];
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (isEmptyCell(board[row][col])) {
        moves.push({ row, col });
      }
    }
  }
  return moves;
}

function isBoardFull(board) {
  return getAvailableMoves(board).length === 0;
}

function checkWin(board, player) {
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
}

function evaluateBoard(board, aiToken, opponentToken) {
  if (checkWin(board, aiToken)) {
    return 10;
  }
  if (checkWin(board, opponentToken)) {
    return -10;
  }
  return 0;
}

function openingPreference(board, aiToken) {
  if (countMoves(board, aiToken) > 0) {
    return null;
  }

  if (isEmptyCell(board[CENTER.row][CENTER.col])) {
    return CENTER;
  }

  for (const corner of CORNERS) {
    if (isEmptyCell(board[corner.row][corner.col])) {
      return corner;
    }
  }

  for (const side of SIDES) {
    if (isEmptyCell(board[side.row][side.col])) {
      return side;
    }
  }

  return null;
}

function moveCategory(move) {
  if (move.row === CENTER.row && move.col === CENTER.col) {
    return 0;
  }

  for (const corner of CORNERS) {
    if (corner.row === move.row && corner.col === move.col) {
      return 1;
    }
  }

  return 2;
}

function selectPreferredMove(moves) {
  if (moves.length === 0) {
    return null;
  }

  let preferred = moves[0];
  let preferredCategory = moveCategory(preferred);

  for (let i = 1; i < moves.length; i += 1) {
    const category = moveCategory(moves[i]);
    if (category < preferredCategory) {
      preferred = moves[i];
      preferredCategory = category;
    }
  }

  return preferred;
}

function minimax(board, depth, isMaximizing, aiToken, opponentToken) {
  const evaluation = evaluateBoard(board, aiToken, opponentToken);
  if (evaluation === 10) {
    return { score: evaluation - depth, move: null };
  }
  if (evaluation === -10) {
    return { score: evaluation + depth, move: null };
  }
  if (isBoardFull(board)) {
    return { score: 0, move: null };
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    const bestMoves = [];

    for (const move of getAvailableMoves(board)) {
      const previousValue = board[move.row][move.col];
      board[move.row][move.col] = aiToken;
      const result = minimax(board, depth + 1, false, aiToken, opponentToken);
      board[move.row][move.col] = previousValue;

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMoves.length = 0;
        bestMoves.push({ ...move });
      } else if (result.score === bestScore) {
        bestMoves.push({ ...move });
      }
    }

    return { score: bestScore, move: depth === 0 ? selectPreferredMove(bestMoves) : bestMoves[0] };
  }

  let bestScore = Infinity;
  for (const move of getAvailableMoves(board)) {
    const previousValue = board[move.row][move.col];
    board[move.row][move.col] = opponentToken;
    const result = minimax(board, depth + 1, true, aiToken, opponentToken);
    board[move.row][move.col] = previousValue;
    if (result.score < bestScore) {
      bestScore = result.score;
    }
  }

  return { score: bestScore, move: null };
}

function getBestMove(board, aiToken = 'O', opponentToken = aiToken === 'X' ? 'O' : 'X') {
  const boardClone = cloneBoard(board);
  const openingMove = openingPreference(boardClone, aiToken);
  if (openingMove) {
    return openingMove;
  }

  const result = minimax(boardClone, 0, true, aiToken, opponentToken);
  return result.move;
}

const MinimaxAI = {
  getBestMove,
  helpers: {
    checkWin,
    openingPreference,
    getAvailableMoves
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MinimaxAI;
} else if (typeof window !== 'undefined') {
  window.MinimaxAI = MinimaxAI;
}
