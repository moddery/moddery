import { describe, expect, test } from 'bun:test';

import {
  ACCOUNT_ROLES,
  ACCOUNT_STATUSES,
  PROJECT_KINDS,
  PROJECT_TYPES,
  REPORT_REASON_OPTIONS,
  REPORT_REASONS,
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

  test('defines account moderation states', () => {
    expect(ACCOUNT_ROLES).toEqual(['USER', 'MODERATOR', 'ADMIN']);
    expect(ACCOUNT_STATUSES).toEqual(['ACTIVE', 'SUSPENDED', 'DELETED']);
  });

  test('keeps report reasons and labels aligned', () => {
    expect(REPORT_REASONS).toContain('BROKEN_OR_MISLEADING');
    expect(REPORT_REASONS.map((reason) => reason)).toEqual(
      REPORT_REASON_OPTIONS.map((option) => option.value),
    );
  });
});
