import { describe, expect, test } from 'bun:test';

import { SUPPORTED_GAME_VERSIONS, SUPPORTED_LOADERS } from './index.js';

describe('shared platform constants', () => {
  test('defines supported loaders and versions', () => {
    expect(SUPPORTED_LOADERS).toContain('fabric');
    expect(SUPPORTED_GAME_VERSIONS.length).toBeGreaterThan(0);
  });
});
