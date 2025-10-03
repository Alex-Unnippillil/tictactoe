const path = require('node:path');
const { JSDOM } = require('jsdom');

const htmlPath = path.resolve(__dirname, '../../index.html');
const STORAGE_KEY = 'tictactoe:player-names';

function createStorage(initialValues = {}) {
  const map = new Map(
    Object.entries(initialValues).map(([key, value]) => [String(key), String(value)]),
  );

  return {
    getItem(key) {
      return map.has(String(key)) ? map.get(String(key)) : null;
    },
    setItem(key, value) {
      map.set(String(key), String(value));
    },
    removeItem(key) {
      map.delete(String(key));
    },
    clear() {
      map.clear();
    },
    key(index) {
      return Array.from(map.keys())[index] ?? null;
    },
    get length() {
      return map.size;
    },
  };
}

async function createDom({ storage } = {}) {
  const dom = await JSDOM.fromFile(htmlPath, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    url: `file://${htmlPath}`,
    beforeParse(window) {
      const localStorage = createStorage(storage ?? {});
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        enumerable: true,
        value: localStorage,
      });

      if (typeof window.HTMLDialogElement !== 'undefined') {
        const proto = window.HTMLDialogElement.prototype;
        if (!proto.showModal) {
          proto.showModal = function showModal() {
            this.setAttribute('open', 'true');
          };
        }
        if (!proto.close) {
          proto.close = function close() {
            this.removeAttribute('open');
          };
        }
      }
    },
  });

  await new Promise((resolve) => {
    dom.window.addEventListener('load', () => resolve());
  });
  await new Promise((resolve) => dom.window.setTimeout(resolve, 0));

  return dom;
}

function click(window, element) {
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
}

function keydown(window, element, key) {
  element.dispatchEvent(
    new window.KeyboardEvent('keydown', {
      key,
      bubbles: true,
    }),
  );
}

describe('Tic Tac Toe UI', () => {
  let dom;

  afterEach(() => {
    if (dom) {
      dom.window.close();
      dom = undefined;
    }
  });

  test('players take turns and the scoreboard increments on a win', async () => {
    dom = await createDom();
    const { window } = dom;
    const { document } = window;

    const status = document.getElementById('statusMessage');
    expect(status.textContent).toContain('Player X');

    const cells = Array.from(document.querySelectorAll('[data-cell]'));
    const sequence = [0, 3, 1, 4, 2];
    sequence.forEach((index) => {
      click(window, cells[index]);
    });

    expect(status.textContent).toContain('wins this round');
    expect(status.textContent).toContain('(X)');

    const xScore = document.querySelector('[data-role="score"][data-player="X"]');
    expect(xScore.textContent).toBe('1');

    const winningCells = sequence.filter((index) => [0, 1, 2].includes(index));
    winningCells.forEach((index) => {
      expect(cells[index].classList.contains('cell--winner')).toBe(true);
    });

    const blockedCell = cells[5];
    click(window, blockedCell);
    expect(blockedCell.textContent).toBe('');

    click(window, document.getElementById('newRoundButton'));
    cells.forEach((cell) => {
      expect(cell.textContent).toBe('');
    });
    expect(xScore.textContent).toBe('1');
  });

  test('reset controls clear the board and scores', async () => {
    dom = await createDom();
    const { window } = dom;
    const { document } = window;
    const cells = Array.from(document.querySelectorAll('[data-cell]'));

    [0, 3, 1, 4, 2].forEach((index) => click(window, cells[index]));

    const xScore = document.querySelector('[data-role="score"][data-player="X"]');
    expect(xScore.textContent).toBe('1');

    click(window, document.getElementById('resetScoresButton'));
    expect(xScore.textContent).toBe('0');

    click(window, document.getElementById('resetGameButton'));
    cells.forEach((cell) => {
      expect(cell.textContent).toBe('');
      expect(cell.hasAttribute('data-mark')).toBe(false);
    });
    expect(xScore.textContent).toBe('0');
  });

  test('settings dialog updates player names and persists them', async () => {
    dom = await createDom();
    const { window } = dom;
    const { document } = window;

    click(window, document.getElementById('settingsButton'));

    const form = document.getElementById('settingsForm');
    const xInput = form.querySelector('input[name="playerX"]');
    const oInput = form.querySelector('input[name="playerO"]');

    xInput.value = 'Alex';
    oInput.value = 'Casey';
    xInput.dispatchEvent(new window.Event('input'));
    oInput.dispatchEvent(new window.Event('input'));

    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

    const names = {
      X: document.querySelector('[data-role="name"][data-player="X"]').textContent,
      O: document.querySelector('[data-role="name"][data-player="O"]').textContent,
    };
    expect(names).toEqual({ X: 'Alex', O: 'Casey' });

    const storageValue = window.localStorage.getItem(STORAGE_KEY);
    expect(storageValue).not.toBeNull();
    expect(JSON.parse(storageValue)).toEqual({ X: 'Alex', O: 'Casey' });

    const status = document.getElementById('statusMessage');
    expect(status.textContent).toContain('Alex');
  });

  test('stored player names are loaded on start', async () => {
    dom = await createDom({
      storage: {
        [STORAGE_KEY]: JSON.stringify({ X: 'Alpha', O: 'Beta' }),
      },
    });
    const { window } = dom;
    const { document } = window;

    expect(document.querySelector('[data-role="name"][data-player="X"]').textContent).toBe('Alpha');
    expect(document.querySelector('[data-role="name"][data-player="O"]').textContent).toBe('Beta');
  });

  test('arrow keys rove focus and enter makes a move', async () => {
    dom = await createDom();
    const { window } = dom;
    const { document } = window;
    const cells = Array.from(document.querySelectorAll('[data-cell]'));

    expect(document.activeElement).toBe(cells[0]);

    keydown(window, cells[0], 'ArrowRight');
    expect(document.activeElement).toBe(cells[1]);

    keydown(window, document.activeElement, 'ArrowDown');
    expect(document.activeElement).toBe(cells[4]);

    keydown(window, document.activeElement, 'Enter');
    expect(cells[4].textContent).toBe('X');
    expect(document.getElementById('statusMessage').textContent).toContain('(O)');

    expect(document.activeElement).toBe(cells[5]);

    keydown(window, document.activeElement, 'ArrowLeft');
    expect(document.activeElement).toBe(cells[4]);

    keydown(window, document.activeElement, 'ArrowLeft');
    expect(document.activeElement).toBe(cells[3]);

    keydown(window, document.activeElement, ' ');
    expect(cells[3].textContent).toBe('O');
  });
});
