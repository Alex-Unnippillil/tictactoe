const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const path = require('node:path');

const scriptPath = path.resolve(__dirname, '../../site/js/pwa/install.js');

function setupDom({ hasMountPoint = true, standalone = false, hasMatchMedia = true } = {}) {
  const mount = hasMountPoint ? '<div class="toolbar__actions" data-install-slot></div>' : '';
  const dom = new JSDOM(`<!doctype html><html><body>${mount}</body></html>`, {
    runScripts: 'outside-only',
    url: 'https://example.test',
  });

  const { window } = dom;
  window.console.warn = () => {};

  Object.defineProperty(window.navigator, 'standalone', {
    configurable: true,
    value: standalone,
  });

  if (hasMatchMedia) {
    window.matchMedia = (query) => ({
      media: query,
      matches: standalone && query === '(display-mode: standalone)',
      addEventListener: () => {},
      addListener: () => {},
      removeEventListener: () => {},
      removeListener: () => {},
    });
  } else {
    delete window.matchMedia;
  }

  return dom;
}

function loadScript(dom) {
  const { window } = dom;
  const scriptSource = require('node:fs').readFileSync(scriptPath, 'utf8');
  window.eval(scriptSource);
  return window.__tictactoePwaInstallTestHooks;
}

function dispatchDomReady(window) {
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
}

test('script initializes only once using __tictactoePwaInstallInitialised guard', () => {
  const dom = setupDom();
  const { window } = dom;

  loadScript(dom);
  const initialHooks = window.__tictactoePwaInstallTestHooks;
  assert.equal(window.__tictactoePwaInstallInitialised, true);

  loadScript(dom);

  assert.equal(window.__tictactoePwaInstallTestHooks, initialHooks);
  assert.equal(window.document.querySelectorAll('[data-role="install-button"]').length, 0);
});

test('injects install button only when mount exists and app is not standalone', () => {
  const dom = setupDom({ hasMountPoint: true, standalone: false });
  const hooks = loadScript(dom);
  dispatchDomReady(dom.window);

  const button = hooks.getInstallButton();
  assert.ok(button);
  assert.equal(button.dataset.role, 'install-button');

  const noMountDom = setupDom({ hasMountPoint: false, standalone: false });
  const noMountHooks = loadScript(noMountDom);
  dispatchDomReady(noMountDom.window);
  assert.equal(noMountHooks.getInstallButton(), null);

  const standaloneDom = setupDom({ hasMountPoint: true, standalone: true });
  const standaloneHooks = loadScript(standaloneDom);
  dispatchDomReady(standaloneDom.window);
  assert.equal(standaloneHooks.getInstallButton(), null);
});

test('button remains hidden and disabled until beforeinstallprompt event arrives', () => {
  const dom = setupDom();
  const hooks = loadScript(dom);

  dispatchDomReady(dom.window);
  const button = hooks.getInstallButton();
  assert.ok(button);
  assert.equal(button.hidden, true);
  assert.equal(button.disabled, true);

  const promptEvent = new dom.window.Event('beforeinstallprompt');
  promptEvent.prompt = () => {};
  promptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });
  dom.window.dispatchEvent(promptEvent);
  dispatchDomReady(dom.window);

  assert.equal(button.hidden, false);
  assert.equal(button.disabled, false);
});

test('click calls prompt and consumes userChoice', async () => {
  const dom = setupDom();
  const hooks = loadScript(dom);

  const calls = [];
  let choiceConsumed = false;
  const promptEvent = new dom.window.Event('beforeinstallprompt');
  promptEvent.prompt = () => calls.push('prompt');
  promptEvent.userChoice = Promise.resolve({ outcome: 'accepted' }).then((result) => {
    choiceConsumed = true;
    return result;
  });

  dom.window.dispatchEvent(promptEvent);
  dispatchDomReady(dom.window);

  const button = hooks.getInstallButton();
  button.click();

  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.deepEqual(calls, ['prompt']);
  assert.equal(choiceConsumed, true);
  assert.equal(hooks.getDeferredPromptEvent(), null);
  assert.equal(button.hidden, true);
  assert.equal(button.disabled, true);
});

test('appinstalled clears deferred prompt and hides button', () => {
  const dom = setupDom();
  const hooks = loadScript(dom);

  const promptEvent = new dom.window.Event('beforeinstallprompt');
  promptEvent.prompt = () => {};
  promptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });
  dom.window.dispatchEvent(promptEvent);
  dispatchDomReady(dom.window);

  const button = hooks.getInstallButton();
  assert.equal(button.hidden, false);

  dom.window.dispatchEvent(new dom.window.Event('appinstalled'));

  assert.equal(hooks.getDeferredPromptEvent(), null);
  assert.equal(button.hidden, true);
  assert.equal(button.disabled, true);
});

test('gracefully handles missing matchMedia and missing mount point', () => {
  const dom = setupDom({ hasMountPoint: false, hasMatchMedia: false });
  const hooks = loadScript(dom);

  assert.doesNotThrow(() => dispatchDomReady(dom.window));
  assert.equal(hooks.getInstallButton(), null);
  assert.equal(hooks.isStandalone(), false);
});
