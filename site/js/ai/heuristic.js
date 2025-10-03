(function (global) {
  if (!global || !global.TicTacToeAI) {
    throw new Error('TicTacToe AI orchestrator is required before loading the heuristic strategy.');
  }

  var orchestrator = global.TicTacToeAI;
  var helpers = orchestrator.helpers;
  var LINES = helpers.getLines();
  var CORNERS = [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2]
  ];
  var SIDES = [
    [0, 1],
    [1, 0],
    [1, 2],
    [2, 1]
  ];

  function findCompletingMove(board, player) {
    for (var i = 0; i < LINES.length; i++) {
      var line = LINES[i];
      var playerCount = 0;
      var emptyCell = null;
      var blocked = false;

      for (var j = 0; j < line.length; j++) {
        var position = line[j];
        var row = position[0];
        var col = position[1];
        var cellValue = board[row][col];

        if (cellValue === player) {
          playerCount += 1;
        } else if (cellValue === '') {
          emptyCell = position;
        } else {
          blocked = true;
          break;
        }
      }

      if (!blocked && playerCount === 2 && emptyCell) {
        return {
          row: emptyCell[0],
          col: emptyCell[1]
        };
      }
    }

    return null;
  }

  function pickFromList(board, cells) {
    for (var i = 0; i < cells.length; i++) {
      var row = cells[i][0];
      var col = cells[i][1];
      if (board[row][col] === '') {
        return { row: row, col: col };
      }
    }

    return null;
  }

  function getMove(context) {
    var board = context.board;
    var player = context.player;
    var opponent = context.opponent;

    var winningMove = findCompletingMove(board, player);
    if (winningMove) {
      return winningMove;
    }

    var blockingMove = findCompletingMove(board, opponent);
    if (blockingMove) {
      return blockingMove;
    }

    if (board[1][1] === '') {
      return { row: 1, col: 1 };
    }

    var cornerMove = pickFromList(board, CORNERS);
    if (cornerMove) {
      return cornerMove;
    }

    return pickFromList(board, SIDES);
  }

  orchestrator.registerStrategy({
    id: 'heuristic',
    label: 'Heuristic (Win/Block)',
    getMove: getMove
  });
})(typeof window !== 'undefined' ? window : null);
