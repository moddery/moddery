import { describe, expect, test } from 'bun:test';

import { isRejectedAuthSessionError } from './session-errors.ts';

describe(isRejectedAuthSessionError.name, () => {
  test('detects GraphQL unauthenticated responses', () => {
    expect(
      isRejectedAuthSessionError({
        graphQLErrors: [
          {
            extensions: { code: 'UNAUTHENTICATED' },
            message: 'Invalid bearer token',
          },
        ],
      }),
    ).toBe(true);
  });

  test('detects unauthorized network responses', () => {
    expect(
      isRejectedAuthSessionError({
        networkError: { statusCode: 401 },
      }),
    ).toBe(true);
  });

  test('ignores non-auth application errors', () => {
    expect(
      isRejectedAuthSessionError({
        graphQLErrors: [
          {
            extensions: { code: 'BAD_USER_INPUT' },
            message: 'Project slug is required',
          },
        ],
      }),
    ).toBe(false);
  });

  test('ignores missing errors', () => {
    expect(isRejectedAuthSessionError(undefined)).toBe(false);
  });
});
