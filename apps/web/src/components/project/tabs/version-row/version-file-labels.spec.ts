import { describe, expect, test } from 'bun:test';

import { fileHashPreview, fileKindLabel } from './version-file-labels.ts';

describe(fileKindLabel.name, () => {
  test('formats file side labels', () => {
    expect(fileKindLabel('CLIENT')).toBe('Client');
    expect(fileKindLabel('SERVER')).toBe('Server');
    expect(fileKindLabel('UNIVERSAL')).toBe('Universal');
  });
});

describe(fileHashPreview.name, () => {
  test('limits hashes and shortens long values', () => {
    expect(
      fileHashPreview([
        { algorithm: 'SHA1', value: '1234567890abcdef' },
        { algorithm: 'SHA256', value: 'abcdef' },
        { algorithm: 'SHA512', value: 'fedcba9876543210' },
        { algorithm: 'BLAKE3', value: 'ignored' },
      ]),
    ).toEqual([
      'SHA1 1234567890ab...',
      'SHA256 abcdef',
      'SHA512 fedcba987654...',
    ]);
  });
});
