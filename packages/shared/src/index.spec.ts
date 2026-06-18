import { describe, expect, test } from 'bun:test';

import {
  PROJECT_KINDS,
  PROJECT_TYPES,
  SUPPORTED_GAME_VERSIONS,
  SUPPORTED_LOADERS,
} from './index.js';

describe('shared platform constants', () => {
  test('defines supported loaders and versions', () => {
    expect(SUPPORTED_LOADERS).toContain('fabric');
    expect(SUPPORTED_GAME_VERSIONS.length).toBeGreaterThan(0);
  });

  test('keeps project kinds and route types aligned', () => {
    expect(PROJECT_KINDS).toContain('RESOURCE_PACK');
    expect(PROJECT_TYPES).toContain('resourcepack');
    expect(PROJECT_KINDS.length).toBe(PROJECT_TYPES.length);
  });
});
