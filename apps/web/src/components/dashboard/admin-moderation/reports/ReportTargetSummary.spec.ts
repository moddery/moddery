import { describe, expect, test } from 'bun:test';

import { reportVersionHref } from './ReportTargetSummary.tsx';

describe(reportVersionHref.name, () => {
  test('links moderation version reports to the selected project version', () => {
    expect(
      reportVersionHref('/mods?project=required-lib&type=mod', '1.0.0+fabric'),
    ).toBe(
      '/mods?project=required-lib&type=mod&tab=versions&version=1.0.0%2Bfabric',
    );
  });
});
