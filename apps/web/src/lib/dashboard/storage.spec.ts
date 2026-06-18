import { describe, expect, test } from 'bun:test';

import { computeVersionFileHashes } from './actions/storage.ts';

describe(computeVersionFileHashes.name, () => {
  test('computes SHA-1 and SHA-256 hashes for local version files', async () => {
    const file = new File(['hello world'], 'example.jar', {
      type: 'application/java-archive',
    });

    const hashes = await computeVersionFileHashes(file);

    expect(hashes).toEqual([
      {
        algorithm: 'SHA1',
        value: '2aae6c35c94fcfb415dbe95f408b9ce91ee846ed',
      },
      {
        algorithm: 'SHA256',
        value:
          'b94d27b9934d3e08a52e52d7da7dabfac484e' +
          'fe37a5380ee9088f7ace2efcde9',
      },
    ]);
  });
});
