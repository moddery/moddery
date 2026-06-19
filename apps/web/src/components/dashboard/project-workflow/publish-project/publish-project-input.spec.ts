import { describe, expect, test } from 'bun:test';

import { type CreateProjectInput } from '../../../../lib/dashboard.ts';
import { assertCreateProjectInput } from './publish-project-input.ts';

describe(assertCreateProjectInput.name, () => {
  test('accepts complete project metadata', () => {
    expect(() => {
      assertCreateProjectInput(baseInput());
    }).not.toThrow();
  });

  test('requires a usable project slug before submitting', () => {
    expect(() => {
      assertCreateProjectInput({ ...baseInput(), slug: '!!' });
    }).toThrow('Project slug must be at least 3 characters');
  });

  test('requires project summary before submitting', () => {
    expect(() => {
      assertCreateProjectInput({ ...baseInput(), summary: '   ' });
    }).toThrow('Project summary is required');
  });

  test('requires project description before submitting', () => {
    expect(() => {
      assertCreateProjectInput({ ...baseInput(), description: '' });
    }).toThrow('Project description is required');
  });
});

function baseInput(): CreateProjectInput {
  return {
    categories: ['utility'],
    color: '#1d9bf0',
    description: 'Created body',
    gameVersions: ['1.21.6'],
    iconUrl: null,
    kind: 'MOD',
    loaders: ['fabric'],
    slug: 'created-project',
    summary: 'Created summary',
    title: 'Created Project',
  };
}
