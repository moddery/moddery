import { describe, expect, test } from 'bun:test';

import { createCollectionButtonLabel } from './CreateCollectionForm.tsx';
import { createOrganizationButtonLabel } from './CreateOrganizationForm.tsx';
import { editCollectionButtonLabel } from './EditCollectionForm.tsx';
import { editOrganizationButtonLabel } from './EditOrganizationForm.tsx';
import {
  assertCollectionInput,
  assertUpdateCollectionInput,
  normalizeCollectionSlug,
  normalizeCreateCollectionInput,
  normalizeUpdateCollectionInput,
} from './collection-input.ts';
import {
  assertOrganizationInput,
  assertUpdateOrganizationInput,
  normalizeCreateOrganizationInput,
  normalizeOrganizationSlug,
  normalizeUpdateOrganizationInput,
} from './organization-input.ts';

describe('content management form labels', () => {
  test('describes collection creation states', () => {
    expect(createCollectionButtonLabel(false)).toBe('Create collection');
    expect(createCollectionButtonLabel(true)).toBe('Creating...');
  });

  test('describes collection edit states', () => {
    expect(editCollectionButtonLabel(false)).toBe('Save collection');
    expect(editCollectionButtonLabel(true)).toBe('Saving...');
  });

  test('describes organization creation states', () => {
    expect(createOrganizationButtonLabel(false)).toBe('Create organization');
    expect(createOrganizationButtonLabel(true)).toBe('Creating...');
  });

  test('describes organization edit states', () => {
    expect(editOrganizationButtonLabel(false)).toBe('Save organization');
    expect(editOrganizationButtonLabel(true)).toBe('Saving...');
  });
});

describe(normalizeCreateCollectionInput.name, () => {
  test('normalizes collection creation fields', () => {
    expect(
      normalizeCreateCollectionInput({
        color: ' #1d9bf0 ',
        description: ' Example list ',
        iconUrl: ' https://example.test/icon.png ',
        name: ' Example ',
        slug: ' Example List! ',
        visibility: 'PUBLIC',
      }),
    ).toEqual({
      color: '#1d9bf0',
      description: 'Example list',
      iconUrl: 'https://example.test/icon.png',
      name: 'Example',
      slug: 'example-list',
      visibility: 'PUBLIC',
    });
  });
});

describe(normalizeUpdateCollectionInput.name, () => {
  test('normalizes collection update fields', () => {
    expect(
      normalizeUpdateCollectionInput({
        collectionId: ' collection-a ',
        color: ' ',
        description: '',
        iconUrl: ' ',
        name: ' Updated ',
        slug: ' Updated List ',
        visibility: 'UNLISTED',
      }),
    ).toEqual({
      collectionId: 'collection-a',
      color: null,
      description: null,
      iconUrl: null,
      name: 'Updated',
      slug: 'updated-list',
      visibility: 'UNLISTED',
    });
  });
});

describe(normalizeCollectionSlug.name, () => {
  test('returns canonical collection slugs', () => {
    expect(normalizeCollectionSlug(' Example List! ')).toBe('example-list');
  });
});

describe(assertCollectionInput.name, () => {
  test('rejects blank collection names', () => {
    expect(() => {
      assertCollectionInput({ name: ' ', slug: 'example' });
    }).toThrow('Collection name is required');
  });

  test('rejects unusable collection slugs', () => {
    expect(() => {
      assertCollectionInput({ name: 'Example', slug: '!!' });
    }).toThrow('Collection slug must be at least 3 characters');
  });
});

describe(assertUpdateCollectionInput.name, () => {
  test('rejects missing selected collections', () => {
    expect(() => {
      assertUpdateCollectionInput({
        collectionId: ' ',
        color: null,
        description: null,
        iconUrl: null,
        name: 'Example',
        slug: 'example',
        visibility: 'PUBLIC',
      });
    }).toThrow('Choose a collection before saving');
  });
});

describe(normalizeCreateOrganizationInput.name, () => {
  test('normalizes organization creation fields', () => {
    expect(
      normalizeCreateOrganizationInput({
        color: ' #1d9bf0 ',
        description: ' Example group ',
        iconUrl: ' https://example.test/icon.png ',
        name: ' Example Org ',
        slug: ' Example Org! ',
      }),
    ).toEqual({
      color: '#1d9bf0',
      description: 'Example group',
      iconUrl: 'https://example.test/icon.png',
      name: 'Example Org',
      slug: 'example-org',
    });
  });
});

describe(normalizeUpdateOrganizationInput.name, () => {
  test('normalizes organization update fields', () => {
    expect(
      normalizeUpdateOrganizationInput({
        color: ' ',
        description: '',
        iconUrl: ' ',
        name: ' Updated Org ',
        organizationId: ' org-a ',
        slug: ' Updated Org ',
      }),
    ).toEqual({
      color: null,
      description: null,
      iconUrl: null,
      name: 'Updated Org',
      organizationId: 'org-a',
      slug: 'updated-org',
    });
  });
});

describe(normalizeOrganizationSlug.name, () => {
  test('returns canonical organization slugs', () => {
    expect(normalizeOrganizationSlug(' Example Org! ')).toBe('example-org');
  });
});

describe(assertOrganizationInput.name, () => {
  test('rejects blank organization names', () => {
    expect(() => {
      assertOrganizationInput({ name: ' ', slug: 'example' });
    }).toThrow('Organization name is required');
  });

  test('rejects unusable organization slugs', () => {
    expect(() => {
      assertOrganizationInput({ name: 'Example', slug: '!!' });
    }).toThrow('Organization slug must be at least 3 characters');
  });
});

describe(assertUpdateOrganizationInput.name, () => {
  test('rejects missing selected organizations', () => {
    expect(() => {
      assertUpdateOrganizationInput({
        color: null,
        description: null,
        iconUrl: null,
        name: 'Example',
        organizationId: ' ',
        slug: 'example',
      });
    }).toThrow('Choose an organization before saving');
  });
});
