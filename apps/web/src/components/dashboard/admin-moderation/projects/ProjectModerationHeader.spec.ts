import { describe, expect, test } from 'bun:test';

import { projectModerationHref } from './ProjectModerationHeader.tsx';

describe(projectModerationHref.name, () => {
  test('links moderation queue projects to their public project route', () => {
    expect(
      projectModerationHref({ kind: 'DATAPACK', slug: 'spawn-rules' }),
    ).toBe('/data-packs?project=spawn-rules&type=datapack');
  });
});
