(function (global) {
  const game = global.gameController;

  const elements = {
    board: null,
    cells: [],
    status: null,
    newGameButton: null,
    startingPlayerSelect: null
  };

  const state = {
    startingPlayer: game.getStartingPlayer()
  };

  function init() {
    elements.board = document.querySelector('[data-board]');
    elements.status = document.querySelector('[data-status]');
    elements.newGameButton = document.querySelector('[data-action="new-game"]');
    elements.startingPlayerSelect = document.querySelector('[data-starting-player]');

    if (!elements.board || !elements.status || !elements.newGameButton) {
      return;
    }

    elements.cells = Array.from(elements.board.querySelectorAll('[data-cell]'));

    elements.cells.forEach((cell) => {
      cell.addEventListener('click', handleCellClick);
    });

    elements.newGameButton.addEventListener('click', handleNewGameClick);

    if (elements.startingPlayerSelect) {
      elements.startingPlayerSelect.addEventListener('change', handleStartingPlayerChange);
      state.startingPlayer = elements.startingPlayerSelect.value;
    }

    startNewGame({ skipPrompt: true });
  }

  function handleCellClick(event) {
    const target = event.currentTarget;
    const cellIndex = Number(target.getAttribute('data-cell'));
    const result = game.makeMove(cellIndex);

    if (!result.valid) {
      return;
    }

    updateBoard();

    if (result.status === 'win') {
      updateStatus(`Player ${result.player} wins!`);
    } else if (result.status === 'draw') {
      updateStatus("It's a draw!");
    } else {
      updateStatus(`Player ${game.getCurrentPlayer()}'s turn`);
    }
  }

  function handleNewGameClick() {
    if (game.hasActiveGame() && !global.confirm('A game is currently in progress. Start a new one?')) {
      return;
    }

    startNewGame({ skipPrompt: true });
  }

  function handleStartingPlayerChange(event) {
    const newPlayer = event.target.value;

    if (newPlayer === state.startingPlayer) {
      return;
    }

    const shouldRestart = !game.hasActiveGame() || global.confirm('Switch starting player and restart the game?');

    if (!shouldRestart) {
      event.target.value = state.startingPlayer;
      return;
    }

    state.startingPlayer = newPlayer;
    startNewGame({ skipPrompt: true });
  }

  function startNewGame({ skipPrompt = false } = {}) {
    if (!skipPrompt && game.hasActiveGame()) {
      const proceed = global.confirm('Start a new game? Your current progress will be lost.');
      if (!proceed) {
        if (elements.startingPlayerSelect) {
          elements.startingPlayerSelect.value = state.startingPlayer;
        }
        return;
      }
    }

    if (elements.startingPlayerSelect) {
      state.startingPlayer = elements.startingPlayerSelect.value;
    }

    game.reset({ startingPlayer: state.startingPlayer });
    updateBoard();
    updateStatus(`Player ${state.startingPlayer}'s turn`);
  }

  function updateBoard() {
    const board = game.getBoard();
    const isOver = game.isGameOver();

    board.forEach((value, index) => {
      const cell = elements.cells[index];
      if (!cell) {
        return;
      }

      cell.textContent = value || '';
      cell.disabled = Boolean(value) || isOver;
    });
  }

  function updateStatus(message) {
    if (elements.status) {
      elements.status.textContent = message;
    }
  }

  global.uiController = {
    init,
    newGame: () => startNewGame({ skipPrompt: true }),
    updateStatus
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window);
