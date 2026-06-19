import { afterEach, describe, expect, test } from 'bun:test';

import { validateEnvironment } from './env.validation.js';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe(validateEnvironment.name, () => {
  test('parses rate limit configuration into the app config namespace', () => {
    process.env = {
      CLICKHOUSE_URL: 'http://localhost:8123',
      CORS_ORIGINS: 'http://localhost:5173',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_ACCESS_TOKEN_SECRET: 'x'.repeat(32),
      MAIL_FROM: 'noreply@example.test',
      OPENSEARCH_NODE: 'http://localhost:9200',
      RATE_LIMIT_REQUESTS: '42',
      RATE_LIMIT_TTL_SECONDS: '15',
      REQUEST_LOGGING_ENABLED: 'false',
      SECURITY_HEADERS_ENABLED: 'false',
      REDIS_URL: 'redis://localhost:6379',
      S3_ACCESS_KEY_ID: 'access-key',
      S3_BUCKET: 'bucket',
      S3_PUBLIC_BASE_URL: 'http://localhost:9000/bucket',
      S3_SECRET_ACCESS_KEY: 'secret-key',
      SMTP_HOST: 'localhost',
    };

    expect(validateEnvironment().app).toMatchObject({
      rateLimitRequests: 42,
      rateLimitTtlSeconds: 15,
      requestLoggingEnabled: false,
      securityHeadersEnabled: false,
      trustProxyHops: 0,
    });
  });
});
