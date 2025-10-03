(function () {
  'use strict';

  var BOARD_SIZE = 3;
  var boardElement = document.getElementById('board');
  var messageElement = document.querySelector('.message');

  if (!boardElement || !messageElement) {
    return;
  }

  var state = {
    board: createEmptyBoard(),
    currentPlayer: 'X',
    gameOver: false
  };

  initialiseBoard();
  updateMessage("Player X's turn");
  syncBoardLabel();
  syncBoardInteractivity();

  function createEmptyBoard() {
    var rows = [];
    for (var r = 0; r < BOARD_SIZE; r += 1) {
      var row = [];
      for (var c = 0; c < BOARD_SIZE; c += 1) {
        row.push('');
      }
      rows.push(row);
    }
    return rows;
  }

  function initialiseBoard() {
    boardElement.innerHTML = '';

    for (var rowIndex = 0; rowIndex < BOARD_SIZE; rowIndex += 1) {
      var rowElement = document.createElement('div');
      rowElement.className = 'board__row';
      rowElement.setAttribute('role', 'row');

      for (var columnIndex = 0; columnIndex < BOARD_SIZE; columnIndex += 1) {
        var cellButton = document.createElement('button');
        cellButton.type = 'button';
        cellButton.className = 'board__cell';
        cellButton.dataset.row = String(rowIndex);
        cellButton.dataset.col = String(columnIndex);
        cellButton.setAttribute('role', 'gridcell');
        cellButton.addEventListener('click', handleCellClick);
        updateCellVisual(cellButton, '');
        rowElement.appendChild(cellButton);
      }

      boardElement.appendChild(rowElement);
    }
  }

  function handleCellClick(event) {
    var cell = event.currentTarget;
    var row = Number(cell.dataset.row);
    var col = Number(cell.dataset.col);

    if (state.gameOver || state.board[row][col]) {
      return;
    }

    placeMark(row, col, state.currentPlayer);

    if (checkWin(state.currentPlayer)) {
      state.gameOver = true;
      updateMessage(state.currentPlayer + ' Wins!');
    } else if (checkDraw()) {
      state.gameOver = true;
      updateMessage("It's a draw!");
    } else {
      state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
      updateMessage('Player ' + state.currentPlayer + "'s turn");
    }

    syncBoardLabel();
    syncBoardInteractivity();
  }

  function placeMark(row, col, mark) {
    state.board[row][col] = mark;
    var cell = getCellElement(row, col);
    if (cell) {
      updateCellVisual(cell, mark);
    }
  }

  function updateCellVisual(cell, mark) {
    cell.textContent = mark;
    updateCellLabel(cell, mark);
  }

  function updateCellLabel(cell, mark) {
    var row = Number(cell.dataset.row) + 1;
    var col = Number(cell.dataset.col) + 1;
    var description = mark ? 'Marked ' + mark : 'Empty';
    cell.setAttribute('aria-label', 'Row ' + row + ', Column ' + col + '. ' + description + '.');
  }

  function syncBoardLabel() {
    var label;
    if (state.gameOver) {
      if (checkWin('X')) {
        label = "Tic Tac Toe board. Game over. X wins.";
      } else if (checkWin('O')) {
        label = "Tic Tac Toe board. Game over. O wins.";
      } else {
        label = 'Tic Tac Toe board. Game over. Draw.';
      }
    } else {
      label = 'Tic Tac Toe board. ' + state.currentPlayer + "'s turn.";
    }

    boardElement.setAttribute('aria-label', label);
  }

  function syncBoardInteractivity() {
    var cells = boardElement.querySelectorAll('.board__cell');
    for (var i = 0; i < cells.length; i += 1) {
      var cell = cells[i];
      var row = Number(cell.dataset.row);
      var col = Number(cell.dataset.col);
      var isMarked = Boolean(state.board[row][col]);
      var disabled = state.gameOver || isMarked;

      cell.disabled = disabled;
      cell.setAttribute('aria-disabled', disabled ? 'true' : 'false');
      updateCellLabel(cell, state.board[row][col]);
    }
  }

  function getCellElement(row, col) {
    return boardElement.querySelector('.board__cell[data-row="' + row + '"][data-col="' + col + '"]');
  }

  function checkWin(player) {
    for (var i = 0; i < BOARD_SIZE; i += 1) {
      if (state.board[i][0] === player && state.board[i][1] === player && state.board[i][2] === player) {
        return true;
      }
      if (state.board[0][i] === player && state.board[1][i] === player && state.board[2][i] === player) {
        return true;
      }
    }

    if (state.board[0][0] === player && state.board[1][1] === player && state.board[2][2] === player) {
      return true;
    }
    if (state.board[0][2] === player && state.board[1][1] === player && state.board[2][0] === player) {
      return true;
    }

    return false;
  }

  function checkDraw() {
    for (var row = 0; row < BOARD_SIZE; row += 1) {
      for (var col = 0; col < BOARD_SIZE; col += 1) {
        if (!state.board[row][col]) {
          return false;
        }
      }
    }
    return true;
  }

  function updateMessage(text) {
    messageElement.textContent = text;
  }
})();
