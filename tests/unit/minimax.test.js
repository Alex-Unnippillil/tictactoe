'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const modulePath = require.resolve(path.join(__dirname, '../../site/js/ai/minimax.js'));

function unloadModule() {
  delete require.cache[modulePath];
  delete globalThis.MinimaxAI;
}

(function shouldAttachToWindowAndGlobalThis() {
  unloadModule();
  globalThis.window = {};
  const api = require(modulePath);

  try {
    assert.ok(api, 'Minimax module should export an API object');
    assert.strictEqual(globalThis.window.MinimaxAI, api);
    assert.strictEqual(globalThis.MinimaxAI, api);
  } finally {
    delete globalThis.window;
  }
})();

(function shouldAttachToGlobalThisWhenWindowMissing() {
  unloadModule();
  const api = require(modulePath);

  assert.ok(api, 'Minimax module should export an API object');
  assert.strictEqual(globalThis.MinimaxAI, api);
})();

console.log('All MinimaxAI global registration tests passed.');
