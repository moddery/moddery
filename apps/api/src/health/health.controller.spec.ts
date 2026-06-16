import { describe, expect, test } from 'bun:test';

import { HealthController } from './health.controller.js';

describe(HealthController.name, () => {
  test('returns ok status', () => {
    const controller = new HealthController();

    expect(controller.check()).toEqual({ status: 'ok' });
  });
});
