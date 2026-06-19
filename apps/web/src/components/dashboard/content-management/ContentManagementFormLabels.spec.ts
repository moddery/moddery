import { describe, expect, test } from 'bun:test';

import { createCollectionButtonLabel } from './CreateCollectionForm.tsx';
import { createOrganizationButtonLabel } from './CreateOrganizationForm.tsx';
import { editCollectionButtonLabel } from './EditCollectionForm.tsx';
import { editOrganizationButtonLabel } from './EditOrganizationForm.tsx';

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
