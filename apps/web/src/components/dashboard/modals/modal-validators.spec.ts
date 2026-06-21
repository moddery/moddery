import { describe, expect, test } from 'bun:test';

import { dashboardModalForKind } from './DashboardModalProvider.tsx';
import { validateCollectionDetailsStep } from './CreateCollectionModal.tsx';
import { validateOrganizationDetailsStep } from './CreateOrganizationModal.tsx';
import { validateProjectIdentityStep } from './CreateProjectModal.tsx';
import { validateVersionMetadataStep } from './UploadVersionModal.tsx';

describe(validateProjectIdentityStep.name, () => {
  test('requires title, a 3+ char slug, and summary', () => {
    expect(
      validateProjectIdentityStep({ slug: 'cool', summary: 'x', title: 'T' }),
    ).toBeNull();
    expect(
      validateProjectIdentityStep({ slug: 'cool', summary: 'x', title: ' ' }),
    ).toBe('Project title is required');
    expect(
      validateProjectIdentityStep({ slug: 'ab', summary: 'x', title: 'T' }),
    ).toBe('Project slug must be at least 3 characters');
    expect(
      validateProjectIdentityStep({ slug: 'cool', summary: ' ', title: 'T' }),
    ).toBe('Project summary is required');
  });
});

describe(validateVersionMetadataStep.name, () => {
  test('requires project, name, and version number', () => {
    expect(
      validateVersionMetadataStep({
        name: 'v',
        projectSlug: 'p',
        versionNumber: '1.0',
      }),
    ).toBeNull();
    expect(
      validateVersionMetadataStep({
        name: 'v',
        projectSlug: '',
        versionNumber: '1.0',
      }),
    ).toBe('Select a project');
    expect(
      validateVersionMetadataStep({
        name: '',
        projectSlug: 'p',
        versionNumber: '1.0',
      }),
    ).toBe('Version name is required');
    expect(
      validateVersionMetadataStep({
        name: 'v',
        projectSlug: 'p',
        versionNumber: '',
      }),
    ).toBe('Version number is required');
  });
});

describe(validateOrganizationDetailsStep.name, () => {
  test('requires a name and a 3+ char slug', () => {
    expect(
      validateOrganizationDetailsStep({ name: 'Acme', slug: 'acme' }),
    ).toBeNull();
    expect(validateOrganizationDetailsStep({ name: '', slug: 'acme' })).toBe(
      'Organization name is required',
    );
    expect(validateOrganizationDetailsStep({ name: 'Acme', slug: 'ab' })).toBe(
      'Organization slug must be at least 3 characters',
    );
  });
});

describe(validateCollectionDetailsStep.name, () => {
  test('requires a name and a 3+ char slug', () => {
    expect(
      validateCollectionDetailsStep({ name: 'Faves', slug: 'faves' }),
    ).toBeNull();
    expect(validateCollectionDetailsStep({ name: '', slug: 'faves' })).toBe(
      'Collection name is required',
    );
    expect(validateCollectionDetailsStep({ name: 'Faves', slug: 'ab' })).toBe(
      'Collection slug must be at least 3 characters',
    );
  });
});

describe(dashboardModalForKind.name, () => {
  test('passes through the active kind and null', () => {
    expect(dashboardModalForKind('project')).toBe('project');
    expect(dashboardModalForKind('collection')).toBe('collection');
    expect(dashboardModalForKind(null)).toBeNull();
  });
});
