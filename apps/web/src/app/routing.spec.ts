import { afterEach, describe, expect, test } from 'bun:test';

import {
  collectionFromUrl,
  organizationFromUrl,
  profileFromUrl,
  projectFromUrl,
  viewFromUrl,
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
