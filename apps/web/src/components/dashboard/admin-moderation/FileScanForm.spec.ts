import { describe, expect, test } from 'bun:test';

import { fileScanRunLabel, fileScanSubmitLabel } from './FileScanForm.tsx';

describe(fileScanSubmitLabel.name, () => {
  test('describes idle and recording states', () => {
    expect(fileScanSubmitLabel(false)).toBe('Record scan');
    expect(fileScanSubmitLabel(true)).toBe('Recording...');
  });
});

describe(fileScanRunLabel.name, () => {
  test('describes idle and scanning states', () => {
    expect(fileScanRunLabel(false)).toBe('Run ClamAV scan');
    expect(fileScanRunLabel(true)).toBe('Scanning...');
  });
});
