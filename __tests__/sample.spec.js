import { describe, expect, test } from '@jest/globals';

describe('sample test', () => {
  test('adds numbers correctly', () => {
    expect(1 + 2).toBe(3);
  });

  test('jsdom environment provides document', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello';
    expect(div.textContent).toBe('Hello');
  });
});
