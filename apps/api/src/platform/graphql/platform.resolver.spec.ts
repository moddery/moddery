import 'reflect-metadata';

import { ForbiddenException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import { type PlatformService } from '../services/platform.service.js';
import { PlatformResolver } from './platform.resolver.js';

describe(PlatformResolver.name, () => {
  test('exposes game version taxonomy without requiring an admin user', async () => {
    const resolver = new PlatformResolver({
      findGameVersions: () =>
        Promise.resolve([{ isActive: true, version: '1.21.6' }]),
    } as PlatformService);

    const gameVersions = await Promise.resolve(resolver.gameVersions());
    const gameVersionsDescriptor = Object.getOwnPropertyDescriptor(
      PlatformResolver.prototype,
      'gameVersions',
    );

    if (gameVersionsDescriptor === undefined) {
      throw new Error('Missing gameVersions resolver');
    }

    expect(gameVersions).toEqual([{ isActive: true, version: '1.21.6' }]);
    expect(
      Reflect.getMetadata(
        IS_PUBLIC_KEY,
        gameVersionsDescriptor.value as object,
      ),
    ).toBe(true);
  });

  test('keeps taxonomy writes restricted to admins', () => {
    const resolver = new PlatformResolver({} as PlatformService);

    expect(() =>
      resolver.upsertGameVersion(
        { isActive: true, version: '1.21.6' },
        regularUser(),
      ),
    ).toThrow(ForbiddenException);
  });
});

function regularUser(): AuthenticatedUser {
  return {
    authMethod: 'session',
    id: 'user-1',
    role: 'USER',
    username: 'creator',
  };
}
