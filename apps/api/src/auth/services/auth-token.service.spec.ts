import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { describe, expect, test } from 'bun:test';

import { AuthTokenService } from './auth-token.service.js';

describe(AuthTokenService.name, () => {
  test('signs and verifies access tokens', async () => {
    const config = new ConfigService({
      app: {
        jwtAccessTokenSecret:
          'test-access-token-secret-at-least-thirty-two-chars',
        jwtAccessTokenTtlSeconds: 900,
      },
    });
    const service = new AuthTokenService(config, new JwtService());
    const token = await service.signAccessToken({
      id: 'user_123',
      role: 'USER',
      username: 'tester',
    });

    const verified = await service.verifyAccessToken(token);

    expect(verified).toEqual({
      id: 'user_123',
      role: 'USER',
      username: 'tester',
    });
  });
});
