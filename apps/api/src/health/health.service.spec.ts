import { describe, expect, test } from 'bun:test';

import { type HealthCheckResult, HealthService } from './health.service.js';

describe(HealthService.name, () => {
  test('reports ready when every dependency probe succeeds', async () => {
    const service = new HealthService(
      { ping: () => Promise.resolve() } as never,
      { $queryRaw: () => Promise.resolve() } as never,
      { ping: () => Promise.resolve() } as never,
      { ping: () => Promise.resolve() } as never,
    );

    await expectReadiness(service, {
      checks: [
        { name: 'database', status: 'up' },
        { name: 'redis', status: 'up' },
        { name: 'search', status: 'up' },
        { name: 'analytics', status: 'up' },
      ],
      status: 'ready',
    });
  });

  test('reports not ready when a dependency probe fails', async () => {
    const service = new HealthService(
      { ping: () => Promise.resolve() } as never,
      { $queryRaw: () => Promise.resolve() } as never,
      { ping: () => Promise.reject(new Error('redis unavailable')) } as never,
      { ping: () => Promise.resolve() } as never,
    );

    await expectReadiness(service, {
      checks: [
        { name: 'database', status: 'up' },
        { name: 'redis', status: 'down' },
        { name: 'search', status: 'up' },
        { name: 'analytics', status: 'up' },
      ],
      status: 'not_ready',
    });
  });
});

async function expectReadiness(
  service: HealthService,
  expected: {
    checks: Pick<HealthCheckResult, 'name' | 'status'>[];
    status: 'not_ready' | 'ready';
  },
): Promise<void> {
  const readiness = await service.readiness();

  expect(readiness.status).toBe(expected.status);
  expect(
    readiness.checks.map(({ name, status }) => ({ name, status })),
  ).toEqual(expected.checks);

  for (const check of readiness.checks) {
    expect(check.durationMs).toBeGreaterThanOrEqual(0);
  }
}
