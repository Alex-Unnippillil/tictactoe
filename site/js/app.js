(function (global) {
  if (!global || !global.document) {
    throw new Error('A browser-like environment is required to run the Tic Tac Toe app.');
  }

  var document = global.document;
  var aiOrchestrator = global.TicTacToeAI;

  if (!aiOrchestrator) {
    throw new Error('TicTacToeAI orchestrator must be loaded before the app.');
  }

  var boardElement = document.getElementById('board');
  var cells = boardElement ? boardElement.querySelectorAll('td') : [];
  var cellList = Array.prototype.slice.call(cells);
  var messageElement = document.getElementById('message');
  var resetButton = document.getElementById('resetButton');
  var aiSelector = document.getElementById('aiSelector');

  if (!boardElement || cellList.length !== 9 || !messageElement || !resetButton || !aiSelector) {
    throw new Error('Required game elements are missing from the DOM.');
  }

  var boardState = createEmptyBoard();
  var currentPlayer = 'X';
  var gameOver = false;
  var selectedStrategyId = aiOrchestrator.getDefaultStrategyId();
  var lines = aiOrchestrator.helpers.getLines();

  function createEmptyBoard() {
    return [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
  }

  function init() {
    populateStrategySelector();
    attachCellListeners();
    resetButton.addEventListener('click', resetGame);
    aiSelector.addEventListener('change', handleStrategyChange);
    updateTurnMessage();
  }

  function populateStrategySelector() {
    var strategies = aiOrchestrator.listStrategies();
    aiSelector.innerHTML = '';

    strategies.forEach(function (strategy) {
      var option = document.createElement('option');
      option.value = strategy.id;
      option.textContent = strategy.label;
      aiSelector.appendChild(option);
    });

    if (selectedStrategyId) {
      aiSelector.value = selectedStrategyId;
    }
  }

  function attachCellListeners() {
    cellList.forEach(function (cell) {
      cell.addEventListener('click', handleCellClick);
    });
  }

  function handleStrategyChange(event) {
    selectedStrategyId = event.target.value;
    aiOrchestrator.setDefaultStrategyId(selectedStrategyId);
    if (!gameOver && currentPlayer === 'O') {
      takeAiTurn();
    }
  }

  function handleCellClick(event) {
    if (gameOver || currentPlayer !== 'X') {
      return;
    }

    var cell = event.currentTarget;
    var row = parseInt(cell.getAttribute('data-row'), 10);
    var col = parseInt(cell.getAttribute('data-col'), 10);

    if (boardState[row][col] !== '') {
      return;
    }

    playMove(row, col, 'X');

    if (checkWin('X')) {
      endGame('X');
      return;
    }

    if (checkDraw()) {
      endGame('draw');
      return;
    }

    currentPlayer = 'O';
    updateTurnMessage();
    takeAiTurn();
  }

  function playMove(row, col, player) {
    boardState[row][col] = player;
    var selector = 'td[data-row="' + row + '"][data-col="' + col + '"]';
    var targetCell = boardElement.querySelector(selector);
    if (targetCell) {
      targetCell.textContent = player;
    }
  }

  function takeAiTurn() {
    if (gameOver) {
      return;
    }

    var move = aiOrchestrator.chooseMove({
      board: boardState,
      player: 'O',
      strategyId: selectedStrategyId,
      opponent: 'X'
    });

    if (!move) {
      if (checkDraw()) {
        endGame('draw');
      } else {
        console.warn('AI did not return a valid move.');
      }
      return;
    }

    playMove(move.row, move.col, 'O');

    if (checkWin('O')) {
      endGame('O');
      return;
    }

    if (checkDraw()) {
      endGame('draw');
      return;
    }

    currentPlayer = 'X';
    updateTurnMessage();
  }

  function checkWin(player) {
    return lines.some(function (line) {
      return line.every(function (position) {
        var row = position[0];
        var col = position[1];
        return boardState[row][col] === player;
      });
    });
  }

  function checkDraw() {
    for (var row = 0; row < 3; row++) {
      for (var col = 0; col < 3; col++) {
        if (boardState[row][col] === '') {
          return false;
        }
      }
    }

    return true;
  }

  function endGame(result) {
    gameOver = true;
    if (result === 'draw') {
      messageElement.textContent = "It's a draw!";
    } else {
      messageElement.textContent = result + ' wins!';
    }
  }

  function updateTurnMessage() {
    if (gameOver) {
      return;
    }

    if (currentPlayer === 'X') {
      messageElement.textContent = 'Your turn (X)';
    } else {
      messageElement.textContent = 'AI thinking...';
    }
  }

  function resetGame() {
    boardState = createEmptyBoard();
    currentPlayer = 'X';
    gameOver = false;
    cellList.forEach(function (cell) {
      cell.textContent = '';
    });
    updateTurnMessage();
  }

  init();
})(typeof window !== 'undefined' ? window : null);
