import test from 'node:test';
import assert from 'node:assert/strict';

import { createStatusController } from '../../site/js/ui/status.js';

function createMockDocument(statusElement) {
  return {
    getElementById(id) {
      if (id === 'statusMessage') {
        return statusElement;
      }
      return null;
    }
  };
}

test('status controller updates text and scores without globals', () => {
  const statusElement = { textContent: '' };
  const nameElements = {
    X: { textContent: '' },
    O: { textContent: '' }
  };
  const scoreElements = {
    X: { textContent: '' },
    O: { textContent: '' }
  };

  const doc = createMockDocument(statusElement);

  const status = createStatusController({
    document: doc,
    statusElement,
    nameElements,
    scoreElements,
    initialNames: { X: 'Alpha', O: 'Beta' }
  });

  assert.equal(nameElements.X.textContent, 'Alpha');
  assert.equal(nameElements.O.textContent, 'Beta');
  assert.equal(statusElement.textContent, 'Alpha (X) to move');
  assert.deepEqual(status.getScores(), { X: 0, O: 0 });

  status.setTurn('O');
  assert.equal(statusElement.textContent, 'Beta (O) to move');

  status.incrementScore('X');
  assert.equal(scoreElements.X.textContent, '1');

  status.announceWin('O');
  assert.match(statusElement.textContent, /Beta \(O\) wins/);

  status.setTurn('X');
  status.applyNames({ X: 'Gamma' });
  assert.equal(nameElements.X.textContent, 'Gamma');
  assert.match(statusElement.textContent, /Gamma \(X\) to move/);

  status.resetScores();
  assert.equal(scoreElements.X.textContent, '0');
  assert.equal(scoreElements.O.textContent, '0');
});
