import { describe, expect, test } from 'bun:test';

import { confirmDeleteMatches } from './ConfirmDeleteDialog.tsx';

describe(confirmDeleteMatches.name, () => {
  test('matches the exact phrase, ignoring surrounding whitespace', () => {
    expect(confirmDeleteMatches('my-project', 'my-project')).toBe(true);
    expect(confirmDeleteMatches('  my-project  ', 'my-project')).toBe(true);
  });

  test('rejects mismatches and empty input', () => {
    expect(confirmDeleteMatches('', 'my-project')).toBe(false);
    expect(confirmDeleteMatches('My-Project', 'my-project')).toBe(false);
    expect(confirmDeleteMatches('other', 'my-project')).toBe(false);
  });
});
