(function () {
  const PREFIX = "ttt";
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

  const sanitiseBoardInput = (board) => {
    const result = new Array(9).fill(null);
    if (!Array.isArray(board)) {
      return result;
    }

    for (let index = 0; index < result.length; index += 1) {
      const value = board[index];
      result[index] = value === "X" || value === "O" ? value : null;
    }

    return result;
  };

  const encodeBoard = (board) =>
    sanitiseBoardInput(board)
      .map((cell) => (cell === "X" || cell === "O" ? cell : "-"))
      .join("");

  const decodeBoard = (value) => {
    if (typeof value !== "string" || value.length !== 9) {
      return null;
    }

    const cells = value.split("");
    const board = new Array(9);
    for (let index = 0; index < 9; index += 1) {
      const mark = cells[index];
      if (mark === "X" || mark === "O") {
        board[index] = mark;
      } else if (mark === "-" || mark === "_") {
        board[index] = null;
      } else {
        return null;
      }
    }

    return board;
  };

  const countMarks = (board) =>
    board.reduce(
      (counts, cell) => {
        if (cell === "X") {
          counts.X += 1;
        } else if (cell === "O") {
          counts.O += 1;
        }
        return counts;
      },
      { X: 0, O: 0 }
    );

  const findWinner = (board) => {
    let winner = null;
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      const mark = board[a];
      if (mark && mark === board[b] && mark === board[c]) {
        if (winner && winner.player !== mark) {
          return { conflict: true };
        }
        winner = { player: mark, line: [...line] };
      }
    }
    return winner;
  };

  const normalisePlayer = (value) => (value === "O" ? "O" : "X");

  const encodeState = ({ board, currentPlayer }) => {
    const boardCode = encodeBoard(board);
    const player = normalisePlayer(currentPlayer);
    return `${PREFIX}:${boardCode}:${player}`;
  };

  const decodeState = (rawHash) => {
    if (typeof rawHash !== "string" || rawHash.length === 0) {
      return null;
    }

    const trimmed = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
    if (!trimmed) {
      return null;
    }

    const parts = trimmed.split(":");
    if (parts.length !== 3 || parts[0] !== PREFIX) {
      return null;
    }

    const board = decodeBoard(parts[1]);
    const player = parts[2] === "O" ? "O" : parts[2] === "X" ? "X" : null;

    if (!board || !player) {
      return null;
    }

    const counts = countMarks(board);
    if (counts.X < counts.O || counts.X - counts.O > 1) {
      return null;
    }

    const winnerInfo = findWinner(board);
    if (winnerInfo && winnerInfo.conflict) {
      return null;
    }

    const winner = winnerInfo ? winnerInfo.player : null;
    const winningLine = winnerInfo ? winnerInfo.line : null;

    const isDraw = !winner && board.every((cell) => cell === "X" || cell === "O");

    if (!winnerInfo && !isDraw) {
      const expectedNext = counts.X === counts.O ? "X" : "O";
      if (player !== expectedNext) {
        return null;
      }
    }

    return {
      board,
      currentPlayer: player,
      winner,
      winningLine,
      isDraw,
    };
  };

  const updateHash = (state) => {
    const encoded = encodeState(state);
    const targetHash = `#${encoded}`;
    if (window.location.hash === targetHash) {
      return targetHash;
    }

    try {
      const { pathname, search } = window.location;
      window.history.replaceState(null, "", `${pathname}${search}${targetHash}`);
    } catch (error) {
      try {
        window.location.hash = encoded;
      } catch (innerError) {
        console.warn("Unable to update share hash", innerError);
      }
    }

    return targetHash;
  };

  const clearHash = () => {
    if (!window.location.hash) {
      return;
    }

    try {
      const { pathname, search } = window.location;
      window.history.replaceState(null, "", `${pathname}${search}`);
    } catch (error) {
      try {
        window.location.hash = "";
      } catch (innerError) {
        console.warn("Unable to clear share hash", innerError);
      }
    }
  };

  const buildShareUrl = (state) => {
    const encoded = encodeState(state);
    const { origin, pathname, search } = window.location;
    return `${origin}${pathname}${search}#${encoded}`;
  };

  window.stateLink = {
    encodeState,
    decodeState,
    getStateFromHash: () => decodeState(window.location.hash),
    setState: updateHash,
    clearHash,
    buildShareUrl,
  };
})();
