import { describe, expect, test } from 'bun:test';

import { scanStatusMeta } from './scan-status.js';

describe(scanStatusMeta.name, () => {
  test('marks clean scan verdicts as clean', () => {
    expect(scanStatusMeta({ status: 'COMPLETE', verdict: 'CLEAN' })).toEqual({
      label: 'CLEAN',
      tone: 'clean',
    });
  });

  test('marks malware and failed verdicts as failed', () => {
    expect(scanStatusMeta({ status: 'COMPLETE', verdict: 'MALWARE' })).toEqual({
      label: 'MALWARE',
      tone: 'failed',
    });
    expect(scanStatusMeta({ status: 'FAILED', verdict: null })).toEqual({
      label: 'FAILED',
      tone: 'failed',
    });
  });

  test('marks running states as pending', () => {
    expect(scanStatusMeta({ status: 'PENDING', verdict: null })).toEqual({
      label: 'PENDING',
      tone: 'pending',
    });
  });

  test('treats unknown scan labels as warnings', () => {
    expect(scanStatusMeta({ status: 'COMPLETE', verdict: 'REVIEW' })).toEqual({
      label: 'REVIEW',
      tone: 'warning',
    });
  });
});
