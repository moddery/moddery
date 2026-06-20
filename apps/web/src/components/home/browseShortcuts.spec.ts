import { PROJECT_TYPES } from '@moddery/shared';
import { describe, expect, test } from 'bun:test';

import { HOME_BROWSE_GROUPS } from './browseShortcuts.ts';

describe('home browse shortcuts', () => {
  test('point at supported project types and searchable tag kinds', () => {
    const keys = new Set<string>();

    for (const group of HOME_BROWSE_GROUPS) {
      expect(PROJECT_TYPES).toContain(group.projectType);
      expect(group.shortcuts.length).toBeGreaterThan(0);

      for (const shortcut of group.shortcuts) {
        expect(shortcut.tag.projectType).toBe(group.projectType);
        expect(['category', 'loader', 'version', 'license']).toContain(
          shortcut.tag.kind,
        );
        expect(shortcut.tag.value.trim()).toBe(shortcut.tag.value);
        expect(shortcut.tag.value).not.toBe('');
        expect(shortcut.label).not.toBe('');
        expect(shortcut.description).not.toBe('');

        const key = `${group.projectType}:${shortcut.tag.kind}:${shortcut.tag.value}`;
        expect(keys.has(key)).toBe(false);
        keys.add(key);
      }
    }
  });
});
