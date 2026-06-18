import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import { HealthController } from './health.controller.js';
import { type HealthService, type ReadinessResult } from './health.service.js';

describe(HealthController.name, () => {
  test('returns ok status', () => {
    const controller = new HealthController(healthService());

    expect(controller.check()).toEqual({ status: 'ok' });
  });

  test('returns readiness checks when dependencies are up', async () => {
    const controller = new HealthController(
      healthService({
        checks: [
          { name: 'database', status: 'up' },
          { name: 'redis', status: 'up' },
        ],
        status: 'ready',
      }),
    );

    await expectReady(controller, {
      checks: [
        { name: 'database', status: 'up' },
        { name: 'redis', status: 'up' },
      ],
      status: 'ready',
    });
  });

  test('rejects readiness when dependencies are down', async () => {
    const controller = new HealthController(
      healthService({
        checks: [{ name: 'search', status: 'down' }],
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
