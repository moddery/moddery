import { describe, expect, test } from 'bun:test';

import { appErrorMessage } from './AppErrorBoundary.js';

describe(appErrorMessage.name, () => {
  test('uses explicit error messages', () => {
    expect(appErrorMessage(new Error('Route failed to render'))).toBe(
      'Route failed to render',
    );
  });

  test('falls back when errors have no message', () => {
    expect(appErrorMessage(new Error('   '))).toBe(
      'Reload the app and try again.',
    );
  });
});
