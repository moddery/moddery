import { describe, expect, test } from 'bun:test';

import {
  wizardCanAdvance,
  wizardNextIndex,
  wizardStepError,
  wizardSubmitLabel,
  type WizardStep,
} from './MultiStepDialog.tsx';

interface Ctx {
  name: string;
}

const requiredNameStep: WizardStep<Ctx> = {
  id: 'name',
  title: 'Name',
  validate: (ctx) => (ctx.name.trim().length === 0 ? 'Name is required' : null),
  render: () => null,
};

const optionalStep: WizardStep<Ctx> = {
  id: 'optional',
  title: 'Optional',
  render: () => null,
};

describe(wizardStepError.name, () => {
  test('returns the validator message when invalid', () => {
    expect(wizardStepError(requiredNameStep, { name: '' })).toBe(
      'Name is required',
    );
  });

  test('returns null when valid', () => {
    expect(wizardStepError(requiredNameStep, { name: 'Mod' })).toBeNull();
  });

  test('treats steps without a validator as always valid', () => {
    expect(wizardStepError(optionalStep, { name: '' })).toBeNull();
  });
});

describe(wizardCanAdvance.name, () => {
  test('mirrors the absence of a step error', () => {
    expect(wizardCanAdvance(requiredNameStep, { name: '' })).toBe(false);
    expect(wizardCanAdvance(requiredNameStep, { name: 'Mod' })).toBe(true);
  });
});

describe(wizardNextIndex.name, () => {
  test('advances but never past the last step', () => {
    expect(wizardNextIndex(0, 3)).toBe(1);
    expect(wizardNextIndex(2, 3)).toBe(2);
  });
});

describe(wizardSubmitLabel.name, () => {
  test('shows a working label while submitting', () => {
    expect(wizardSubmitLabel(false, 'Create')).toBe('Create');
    expect(wizardSubmitLabel(true, 'Create')).toBe('Working…');
  });
});
