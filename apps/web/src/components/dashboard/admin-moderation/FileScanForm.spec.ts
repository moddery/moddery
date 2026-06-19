import { describe, expect, test } from 'bun:test';

import { fileScanSubmitLabel } from './FileScanForm.tsx';

describe(fileScanSubmitLabel.name, () => {
  test('describes idle and recording states', () => {
    expect(fileScanSubmitLabel(false)).toBe('Record scan');
    expect(fileScanSubmitLabel(true)).toBe('Recording...');
  });
});
