import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import { HealthController } from './health.controller.js';
import { type HealthService, type ReadinessResult } from './health.service.js';

describe(HealthController.name, () => {
  test('returns ok status', () => {
    const controller = new HealthController(healthService());

    expect(controller.check()).toEqual({ status: 'ok' });
  });

  test('returns liveness status without dependency probes', () => {
    const controller = new HealthController(healthService());

    expect(controller.live()).toEqual({ status: 'live' });
  });

  test('returns readiness checks when dependencies are up', async () => {
    const controller = new HealthController(
      healthService({
        checks: [
          { durationMs: 4, name: 'database', status: 'up' },
          { durationMs: 2, name: 'redis', status: 'up' },
        ],
        status: 'ready',
      }),
    );

    await expectReady(controller, {
      checks: [
        { durationMs: 4, name: 'database', status: 'up' },
        { durationMs: 2, name: 'redis', status: 'up' },
      ],
      status: 'ready',
    });
  });

  test('rejects readiness when dependencies are down', async () => {
    const controller = new HealthController(
      healthService({
        checks: [{ durationMs: 10, name: 'search', status: 'down' }],
        status: 'not_ready',
      }),
    );

    try {
      await controller.ready();
      throw new Error('Expected readiness to fail');
    } catch (caught) {
      expect(caught).toBeInstanceOf(ServiceUnavailableException);
    }
  });
});

function healthService(result: ReadinessResult = defaultReadiness()) {
  return {
    readiness: () => Promise.resolve(result),
  } as Pick<HealthService, 'readiness'> as HealthService;
}

async function expectReady(
  controller: HealthController,
  result: ReadinessResult,
): Promise<void> {
  expect(await controller.ready()).toEqual(result);
}

function defaultReadiness(): ReadinessResult {
  return {
    checks: [],
    status: 'ready',
  };
}
