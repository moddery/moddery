import { ForbiddenException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import { assertCredentialScopes } from './jwt-auth.guard.js';

describe(assertCredentialScopes.name, () => {
  test('allows session users without credential scope metadata', () => {
    expect(() => {
      assertCredentialScopes(
        {
          authMethod: 'session',
          id: 'user-a',
          role: 'USER',
          username: 'seed',
        },
        undefined,
      );
    }).not.toThrow();
  });

  test('rejects personal access tokens on unscoped operations', () => {
    expect(() => {
      assertCredentialScopes(
        {
          authMethod: 'api_token',
          credentialScopes: ['read:projects'],
          id: 'user-a',
          role: 'USER',
          username: 'seed',
        },
        undefined,
      );
    }).toThrow(ForbiddenException);
  });

  test('rejects personal access tokens missing required scopes', () => {
    expect(() => {
      assertCredentialScopes(
        {
          authMethod: 'api_token',
          credentialScopes: ['read:projects'],
          id: 'user-a',
          role: 'USER',
          username: 'seed',
        },
        ['write:projects'],
      );
    }).toThrow('Personal access token requires write:projects');
  });

  test('allows personal access tokens with required scopes', () => {
    expect(() => {
      assertCredentialScopes(
        {
          authMethod: 'api_token',
          credentialScopes: ['read:projects', 'write:projects'],
          id: 'user-a',
          role: 'USER',
          username: 'seed',
        },
        ['read:projects', 'write:projects'],
      );
    }).not.toThrow();
  });
});
