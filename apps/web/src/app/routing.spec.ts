import { afterEach, describe, expect, test } from 'bun:test';

import {
  collectionFromUrl,
  collectionPath,
  dashboardPath,
  organizationFromUrl,
  organizationPath,
  profileFromUrl,
  projectFromUrl,
  projectPath,
  staticNavigationUrl,
  staticViewFromNavigationUrl,
  userPath,
  viewFromUrl,
  writeOrganizationToUrl,
  writeDashboardToUrl,
  writePlatformToUrl,
  writeProjectListToUrl,
  writeProjectToUrl,
  writeStatusToUrl,
} from './routing.ts';

const originalWindow = Reflect.get(globalThis, 'window') as Window | undefined;

afterEach(() => {
  if (originalWindow) {
    Reflect.set(globalThis, 'window', originalWindow);
    return;
  }

  Reflect.deleteProperty(globalThis, 'window');
});

describe('routing helpers', () => {
  test('reads project selections from path and query state', () => {
    setWindowUrl('https://moddery.test/plugins?project=world-edit');

    expect(projectFromUrl()).toEqual({
      projectType: 'plugin',
      slug: 'world-edit',
    });
    expect(viewFromUrl()).toBe('discover');
  });

  test('falls back to mods for invalid project type query state', () => {
    setWindowUrl('https://moddery.test/?project=utility&type=unknown');

    expect(projectFromUrl()).toEqual({
      projectType: 'mod',
      slug: 'utility',
    });
  });

  test('reads decoded nested resource paths', () => {
    setWindowUrl('https://moddery.test/collections/space%20user/tech%20packs');

    expect(collectionFromUrl()).toEqual({
      ownerUsername: 'space user',
      slug: 'tech packs',
    });

    setWindowUrl('https://moddery.test/users/creator%20one');
    expect(profileFromUrl()).toBe('creator one');

    setWindowUrl('https://moddery.test/organizations/build%20team');
    expect(organizationFromUrl()).toBe('build team');
  });

  test('builds encoded user profile paths', () => {
    expect(userPath('creator one')).toBe('/users/creator%20one');
  });

  test('builds encoded organization and collection paths', () => {
    expect(organizationPath('build team')).toBe('/organizations/build%20team');
    expect(
      collectionPath({
        ownerUsername: 'creator one',
        slug: 'tech packs',
      }),
    ).toBe('/collections/creator%20one/tech%20packs');
  });

  test('builds dashboard section paths', () => {
    expect(dashboardPath()).toBe('/dashboard');
    expect(dashboardPath('dashboard-messages')).toBe(
      '/dashboard#dashboard-messages',
    );
  });

  test('builds encoded project paths', () => {
    expect(projectPath('modpack', 'tech pack')).toBe(
      '/modpacks?project=tech%20pack&type=modpack',
    );
  });

  test('writes project URLs and clears stale project state', () => {
    const fakeWindow = setWindowUrl(
      'https://moddery.test/users/alex?project=old&type=plugin&tab=versions',
    );

    writeProjectToUrl({ projectType: 'shader', slug: 'soft-lighting' });
    expect(fakeWindow.location.pathname).toBe('/shaders');
    expect(fakeWindow.location.searchParams.get('project')).toBe(
      'soft-lighting',
    );
    expect(fakeWindow.location.searchParams.get('type')).toBe('shader');
    expect(fakeWindow.location.searchParams.get('tab')).toBe('versions');

    writeProjectToUrl(null);
    expect(fakeWindow.location.searchParams.get('project')).toBeNull();
    expect(fakeWindow.location.searchParams.get('type')).toBeNull();
    expect(fakeWindow.location.searchParams.get('tab')).toBeNull();
  });

  test('writes project listing URLs without stale detail parameters', () => {
    const fakeWindow = setWindowUrl(
      'https://moddery.test/?project=old&type=plugin&tab=versions&view=discover',
    );

    writeProjectListToUrl('resourcepack');

    expect(fakeWindow.location.pathname).toBe('/resource-packs');
    expect(fakeWindow.location.search).toBe('');
  });

  test('reads and writes the status route', () => {
    const fakeWindow = setWindowUrl(
      'https://moddery.test/status?project=old&type=plugin&tab=versions',
    );

    expect(viewFromUrl()).toBe('status');

    writeStatusToUrl();

    expect(fakeWindow.location.pathname).toBe('/status');
    expect(fakeWindow.location.search).toBe('');
  });

  test('recognizes static app routes for internal anchor navigation', () => {
    expect(staticViewFromNavigationUrl(new URL('https://moddery.test/'))).toBe(
      'home',
    );
    expect(
      staticViewFromNavigationUrl(new URL('https://moddery.test/collections')),
    ).toBe('collections');
    expect(
      staticViewFromNavigationUrl(new URL('https://moddery.test/dashboard')),
    ).toBe('dashboard');
    expect(
      staticViewFromNavigationUrl(
        new URL('https://moddery.test/notifications'),
      ),
    ).toBe('notifications');
    expect(
      staticViewFromNavigationUrl(
        new URL('https://moddery.test/organizations'),
      ),
    ).toBe('organization');
    expect(
      staticViewFromNavigationUrl(new URL('https://moddery.test/platform')),
    ).toBe('platform');
    expect(
      staticViewFromNavigationUrl(new URL('https://moddery.test/status')),
    ).toBe('status');
    expect(
      staticViewFromNavigationUrl(new URL('https://moddery.test/users')),
    ).toBe('users');
    expect(
      staticViewFromNavigationUrl(new URL('https://moddery.test/users/alex')),
    ).toBeNull();
  });

  test('cleans stale project parameters from static navigation URLs', () => {
    const nextUrl = staticNavigationUrl(
      new URL(
        'https://moddery.test/dashboard?project=old&type=plugin&tab=versions&view=discover#dashboard-messages',
      ),
    );

    expect(nextUrl?.pathname).toBe('/dashboard');
    expect(nextUrl?.search).toBe('');
    expect(nextUrl?.hash).toBe('#dashboard-messages');
    expect(
      staticNavigationUrl(new URL('https://moddery.test/users/alex')),
    ).toBeNull();
  });

  test('reads and writes the platform route', () => {
    const fakeWindow = setWindowUrl(
      'https://moddery.test/platform?project=old&type=plugin&tab=versions',
    );

    expect(viewFromUrl()).toBe('platform');

    writePlatformToUrl();

    expect(fakeWindow.location.pathname).toBe('/platform');
    expect(fakeWindow.location.search).toBe('');
  });

  test('writes dashboard route without stale hashes', () => {
    const fakeWindow = setWindowUrl(
      'https://moddery.test/notifications#dashboard-account',
    );

    writeDashboardToUrl();

    expect(fakeWindow.location.pathname).toBe('/dashboard');
    expect(fakeWindow.location.search).toBe('');
    expect(fakeWindow.location.hash).toBe('');
  });

  test('writes organization detail URLs without stale detail parameters', () => {
    const fakeWindow = setWindowUrl(
      'https://moddery.test/mods?project=old&type=mod&tab=versions',
    );

    writeOrganizationToUrl('build team');

    expect(fakeWindow.location.pathname).toBe('/organizations/build%20team');
    expect(fakeWindow.location.search).toBe('');
  });
});

function setWindowUrl(href: string) {
  const fakeWindow = {
    location: new URL(href),
    history: {
      pushState: (_state: unknown, _title: string, nextUrl: string | URL) => {
        fakeWindow.location = new URL(
          String(nextUrl),
          fakeWindow.location.href,
        );
      },
    },
  };

  Reflect.set(globalThis, 'window', fakeWindow as unknown as Window);

  return fakeWindow;
}
