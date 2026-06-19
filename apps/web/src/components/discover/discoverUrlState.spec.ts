import { afterEach, describe, expect, test } from 'bun:test';

import {
  readDiscoverUrlState,
  writeDiscoverUrlState,
} from './discoverUrlState.js';

const originalWindow = Reflect.get(globalThis, 'window') as Window | undefined;

afterEach(() => {
  if (originalWindow) {
    Reflect.set(globalThis, 'window', originalWindow);
    return;
  }

  Reflect.deleteProperty(globalThis, 'window');
});

describe(readDiscoverUrlState.name, () => {
  test('reads license filters from the current URL', () => {
    setWindowUrl(
      'https://moddery.test/mods?license=mit&license=apache-2.0&loader=fabric',
    );

    expect(readDiscoverUrlState().filters).toEqual({
      categories: [],
      licenses: ['mit', 'apache-2.0'],
      loaders: ['fabric'],
      versions: [],
    });
  });
});

describe(writeDiscoverUrlState.name, () => {
  test('writes license filters with the rest of discover state', () => {
    const fakeWindow = setWindowUrl(
      'https://moddery.test/mods?project=old&type=mod',
    );

    writeDiscoverUrlState({
      categories: ['optimization'],
      licenses: ['mit'],
      loaders: ['fabric'],
      page: 2,
      projectType: 'mod',
      query: 'sodium',
      sort: 'follows',
      versions: ['1.21.6'],
      view: '10',
    });

    expect(fakeWindow.location.pathname).toBe('/mods');
    expect(fakeWindow.location.search).toBe(
      '?q=sodium&sort=follows&view=10&page=2&version=1.21.6&loader=fabric&license=mit&category=optimization',
    );
  });
});

function setWindowUrl(href: string) {
  const fakeWindow = {
    location: new URL(href),
    history: {
      replaceState: (
        _state: unknown,
        _title: string,
        nextUrl: string | URL,
      ) => {
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
