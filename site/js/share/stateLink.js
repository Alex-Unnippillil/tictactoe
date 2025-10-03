(function (global) {
  var BOARD_PARAM = 'board';
  var PLAYER_PARAM = 'player';
  var SCORE_KEYS = {
    X: 'sx',
    O: 'so',
    draws: 'sd'
  };

  function normaliseBoard(board) {
    if (!Array.isArray(board) || board.length !== 3) {
      return createEmptyBoard();
    }

    return board.map(function (row) {
      if (!Array.isArray(row) || row.length !== 3) {
        return ['', '', ''];
      }

      return row.map(function (cell) {
        return cell === 'X' || cell === 'O' ? cell : '';
      });
    });
  }

  function createEmptyBoard() {
    return [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
  }

  function encodeBoard(board) {
    var flattened = [];
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var value = board[i] && board[i][j];
        flattened.push(value === 'X' || value === 'O' ? value : '-');
      }
    }
    return flattened.join('');
  }

  function decodeBoard(encoded) {
    if (typeof encoded !== 'string' || encoded.length !== 9) {
      return null;
    }

    var board = createEmptyBoard();
    for (var i = 0; i < encoded.length; i++) {
      var char = encoded.charAt(i);
      if (char !== 'X' && char !== 'O' && char !== '-') {
        return null;
      }
      var row = Math.floor(i / 3);
      var col = i % 3;
      board[row][col] = char === '-' ? '' : char;
    }

    return board;
  }

  function encodeScores(scores) {
    var params = new URLSearchParams();
    if (!scores || typeof scores !== 'object') {
      scores = { X: 0, O: 0, draws: 0 };
    }

    params.set(SCORE_KEYS.X, Number(scores.X) || 0);
    params.set(SCORE_KEYS.O, Number(scores.O) || 0);
    params.set(SCORE_KEYS.draws, Number(scores.draws) || 0);

    var serialized = params.toString();
    return serialized ? '#' + serialized : '';
  }

  function decodeScores(hash) {
    if (typeof hash !== 'string' || hash.length === 0) {
      return null;
    }

    var params = new URLSearchParams(hash.replace(/^#/, ''));
    var x = Number(params.get(SCORE_KEYS.X));
    var o = Number(params.get(SCORE_KEYS.O));
    var draws = Number(params.get(SCORE_KEYS.draws));

    if (!isFinite(x) || !isFinite(o) || !isFinite(draws)) {
      return null;
    }

    return {
      X: Math.max(0, Math.floor(x)),
      O: Math.max(0, Math.floor(o)),
      draws: Math.max(0, Math.floor(draws))
    };
  }

  function decodePlayer(player) {
    if (player === 'X' || player === 'O') {
      return player;
    }
    return null;
  }

  function buildShareUrl(state) {
    var url = new URL(global.location.href);
    var board = state && Array.isArray(state.board) ? state.board : createEmptyBoard();
    var player = state && state.currentPlayer ? state.currentPlayer : 'X';
    var scores = state && state.scores ? state.scores : { X: 0, O: 0, draws: 0 };

    url.searchParams.set(BOARD_PARAM, encodeBoard(board));
    url.searchParams.set(PLAYER_PARAM, decodePlayer(player) || 'X');
    url.hash = encodeScores(scores);

    return url.toString();
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      try {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        var successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (successful) {
          resolve();
        } else {
          reject(new Error('Copy command was unsuccessful'));
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  function copyStateLink(state) {
    var link = buildShareUrl(state);
    return copyToClipboard(link).then(function () {
      return link;
    });
  }

  function readStateFromUrl() {
    try {
      var url = new URL(global.location.href);
      var boardParam = url.searchParams.get(BOARD_PARAM);
      var playerParam = url.searchParams.get(PLAYER_PARAM);
      var board = decodeBoard(boardParam);
      var player = decodePlayer(playerParam);
      var scores = decodeScores(url.hash);

      return {
        board: board,
        currentPlayer: player,
        scores: scores
      };
    } catch (err) {
      return {
        board: null,
        currentPlayer: null,
        scores: null
      };
    }
  }

  global.StateLink = {
    buildShareUrl: buildShareUrl,
    copyStateLink: copyStateLink,
    readStateFromUrl: readStateFromUrl,
    createEmptyBoard: createEmptyBoard,
    normaliseBoard: normaliseBoard
  };
})(window);
