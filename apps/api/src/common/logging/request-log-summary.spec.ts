import { describe, expect, test } from 'bun:test';
import { type GraphQLResolveInfo } from 'graphql';

import {
  graphqlRequestLogSummary,
  httpRequestLogSummary,
  shouldSkipRequestLog,
} from './request-log-summary.js';

describe(graphqlRequestLogSummary.name, () => {
  test('summarizes GraphQL requests without logging body variables', () => {
    const summary = graphqlRequestLogSummary({
      info: {
        fieldName: 'projectSearch',
        operation: {
          name: { value: 'SearchProjects' },
          operation: 'query',
        },
      } as GraphQLResolveInfo,
      request: {
        body: { operationName: 'SearchProjects' },
        headers: {
          'user-agent': 'bun-test',
          'x-forwarded-for': '203.0.113.10, 10.0.0.1',
        },
        user: { id: 'user_123' },
      },
    });

    expect(summary).toEqual({
      ipAddress: '203.0.113.10',
      method: 'POST',
      operation: 'SearchProjects',
      path: '/graphql',
      transport: 'graphql',
      userAgent: 'bun-test',
      userId: 'user_123',
    });
  });

  test('falls back to operation kind and field name', () => {
    const summary = graphqlRequestLogSummary({
      info: {
        fieldName: 'me',
        operation: {
          operation: 'query',
        },
      } as GraphQLResolveInfo,
      request: {},
    });

    expect(summary.operation).toBe('query.me');
  });
});

describe(httpRequestLogSummary.name, () => {
  test('summarizes HTTP requests', () => {
    expect(
      httpRequestLogSummary({
        headers: { 'user-agent': 'curl' },
        ip: '127.0.0.1',
        method: 'GET',
        path: '/health/ready',
      }),
    ).toEqual({
      ipAddress: '127.0.0.1',
      method: 'GET',
      operation: '/health/ready',
      path: '/health/ready',
      transport: 'http',
      userAgent: 'curl',
      userId: null,
    });
  });
});

describe(shouldSkipRequestLog.name, () => {
  test('skips health check noise but keeps GraphQL operations', () => {
    expect(
      shouldSkipRequestLog({
        ipAddress: null,
        method: 'GET',
        operation: '/health/ready',
        path: '/health/ready',
        transport: 'http',
        userAgent: null,
        userId: null,
      }),
    ).toBe(true);

    expect(
      shouldSkipRequestLog({
        ipAddress: null,
        method: 'POST',
        operation: 'query.me',
        path: '/graphql',
        transport: 'graphql',
        userAgent: null,
        userId: null,
      }),
    ).toBe(false);
  });
});
