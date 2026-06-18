import { afterEach, describe, expect, test } from 'bun:test';

import { fetchReadiness } from './health.js';

const originalFetch = globalThis.fetch;

describe(fetchReadiness.name, () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('loads ready service checks', async () => {
    const calls: string[] = [];
    globalThis.fetch = mockFetch((url: string | URL | Request) => {
      calls.push(requestUrl(url));

      return Promise.resolve(
        new Response(
          JSON.stringify({
            checks: [
              { name: 'database', status: 'up' },
              { name: 'redis', status: 'up' },
            ],
            status: 'ready',
          }),
          { status: 200 },
        ),
      );
    });

    const readiness = await fetchReadiness();

    expect(calls[0]).toBe('http://localhost:3000/health/ready');
    expect(readiness.status).toBe('ready');
    expect(readiness.checks).toEqual([
      { name: 'database', status: 'up' },
      { name: 'redis', status: 'up' },
    ]);
  });

  test('loads degraded service checks from error responses', async () => {
    globalThis.fetch = mockFetch(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            error: 'Service Unavailable',
            message: {
              checks: [
                { name: 'search', status: 'down' },
                { name: 'analytics', status: 'up' },
              ],
              status: 'not_ready',
            },
            statusCode: 503,
          }),
          { status: 503 },
        ),
      ),
    );

    const readiness = await fetchReadiness();

    expect(readiness).toEqual({
      checks: [
        { name: 'search', status: 'down' },
        { name: 'analytics', status: 'up' },
      ],
      status: 'not_ready',
    });
  });
});

function mockFetch(
  implementation: (url: string | URL | Request) => Promise<Response>,
): typeof fetch {
  return implementation as unknown as typeof fetch;
}

function requestUrl(url: string | URL | Request): string {
  if (typeof url === 'string') return url;
  if (url instanceof URL) return url.toString();

  return url.url;
}
