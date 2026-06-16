import { describe, expect, test } from 'bun:test';

import { App } from './App.js';

describe(App.name, () => {
  test('exports the application component', () => {
    expect(typeof App).toBe('function');
  });
});
