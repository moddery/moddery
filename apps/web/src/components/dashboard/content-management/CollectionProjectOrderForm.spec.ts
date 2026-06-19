import { describe, expect, test } from 'bun:test';

import {
  collectionProjectOrderButtonLabel,
  parseSortOrder,
} from './CollectionProjectOrderForm.tsx';

describe(collectionProjectOrderButtonLabel.name, () => {
  test('describes idle and saving states', () => {
    expect(collectionProjectOrderButtonLabel(false)).toBe('Save');
    expect(collectionProjectOrderButtonLabel(true)).toBe('Saving...');
  });
});

describe(parseSortOrder.name, () => {
  test('parses finite integer order values', () => {
    expect(parseSortOrder('3')).toBe(3);
    expect(parseSortOrder('12.8')).toBe(12);
    expect(parseSortOrder('nope')).toBe(0);
  });
});
