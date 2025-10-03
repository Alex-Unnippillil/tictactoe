const { readFileSync } = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const htmlPath = path.resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

function createDom() {
  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  const { window } = dom;
  const { document } = window;

  const board = document.querySelector('.board');

  const clickCell = (row, col) => {
    const cell = board.rows[row].cells[col];
    cell.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    return cell;
  };

  const getCells = () => Array.from(board.querySelectorAll('td'));
  const getMessage = () => document.querySelector('.message');

  const resetState = () => {
    window.currentPlayer = 'X';
    window.board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ];
    window.gameOver = false;
    getCells().forEach((cell) => {
      cell.textContent = '';
    });
    getMessage().textContent = '';
  };

  return { dom, window, document, clickCell, getCells, getMessage, resetState };
}

describe('uiController DOM interactions', () => {
  let domContext;

  afterEach(() => {
    if (domContext) {
      domContext.dom.window.close();
      domContext = undefined;
    }
  });

  test('clicking a cell places the current player token and switches turns', () => {
    domContext = createDom();
    const { clickCell, window } = domContext;

    const firstCell = clickCell(0, 0);
    expect(firstCell.textContent).toBe('X');
    expect(window.board[0][0]).toBe('X');
    expect(window.currentPlayer).toBe('O');

    const secondCell = clickCell(1, 1);
    expect(secondCell.textContent).toBe('O');
    expect(window.board[1][1]).toBe('O');
    expect(window.currentPlayer).toBe('X');
  });

  test('winning move updates the status message and locks the board', () => {
    domContext = createDom();
    const { clickCell, document, window } = domContext;

    clickCell(0, 0); // X
    clickCell(1, 0); // O
    clickCell(0, 1); // X
    clickCell(1, 1); // O
    clickCell(0, 2); // X wins horizontally

    expect(document.querySelector('.message').textContent).toBe('X Wins!');
    expect(window.gameOver).toBe(true);

    const blockedCell = document.querySelector('.board').rows[2].cells[0];
    blockedCell.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(blockedCell.textContent).toBe('');
    expect(window.board[2][0]).toBe('');
  });

  test('full board without winner results in a draw message', () => {
    domContext = createDom();
    const { clickCell, document, window } = domContext;

    const drawMoves = [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 1],
      [1, 0],
      [2, 0],
      [1, 2],
      [2, 2],
      [2, 1],
    ];

    drawMoves.forEach(([row, col]) => {
      clickCell(row, col);
    });

    expect(document.querySelector('.message').textContent).toBe("It's a draw!");
    expect(window.gameOver).toBe(true);
  });

  test('resetting state clears the board and allows new moves', () => {
    domContext = createDom();
    const { clickCell, resetState, getCells, getMessage, window } = domContext;

    clickCell(0, 0);
    clickCell(1, 1);

    resetState();

    getCells().forEach((cell) => {
      expect(cell.textContent).toBe('');
    });
    expect(window.board.flat().every((value) => value === '')).toBe(true);
    expect(getMessage().textContent).toBe('');
    expect(window.currentPlayer).toBe('X');
    expect(window.gameOver).toBe(false);

    const restartedCell = clickCell(2, 2);
    expect(restartedCell.textContent).toBe('X');
    expect(window.board[2][2]).toBe('X');
  });
});
