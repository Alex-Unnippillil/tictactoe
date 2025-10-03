const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

describe('UI controller', () => {
  let dom;
  let document;

  const loadDom = async () => {
    const virtualConsole = new jsdom.VirtualConsole();
    virtualConsole.on('jsdomError', () => {});

    dom = await JSDOM.fromFile(path.resolve(__dirname, '../../site/index.html'), {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/tictactoe/',
      virtualConsole,
    });

    await new Promise((resolve) => {
      dom.window.addEventListener('load', resolve);
    });

    document = dom.window.document;
  };

  beforeEach(async () => {
    await loadDom();
  });

  afterEach(() => {
    if (dom) {
      dom.window.close();
      dom = undefined;
      document = undefined;
    }
  });

  it('renders a 3x3 grid of focusable cells', () => {
    const board = document.querySelector('[data-testid="board"]');
    expect(board).not.toBeNull();

    const cells = board.querySelectorAll('[data-testid="cell"]');
    expect(cells).toHaveLength(9);
    cells.forEach((cell) => {
      expect(cell.getAttribute('role')).toBe('gridcell');
      expect(cell.tabIndex).toBeGreaterThanOrEqual(0);
    });
  });

  it('places marks and updates the status message', () => {
    const status = document.querySelector('[data-testid="status"]');
    const cells = Array.from(document.querySelectorAll('[data-testid="cell"]'));

    expect(status.textContent).toContain("Player X");

    cells[4].click();
    expect(cells[4].textContent).toBe('X');
    expect(status.textContent.toLowerCase()).toContain('player o');

    cells[3].click();
    expect(cells[3].textContent).toBe('O');
    expect(status.textContent.toLowerCase()).toContain('player x');
  });

  it('supports arrow key navigation between cells', () => {
    const cells = Array.from(document.querySelectorAll('[data-testid="cell"]'));

    cells[0].focus();
    expect(document.activeElement).toBe(cells[0]);

    const pressKey = (target, key) => {
      const event = new dom.window.KeyboardEvent('keydown', {
        key,
        bubbles: true,
      });
      target.dispatchEvent(event);
    };

    pressKey(cells[0], 'ArrowRight');
    expect(document.activeElement).toBe(cells[1]);

    pressKey(cells[1], 'ArrowDown');
    expect(document.activeElement).toBe(cells[4]);

    pressKey(cells[4], 'ArrowLeft');
    expect(document.activeElement).toBe(cells[3]);
  });
});
