import { afterEach, describe, expect, test } from 'bun:test';

import {
  dashboardSectionHref,
  scrollToDashboardSection,
} from './DashboardSectionNav.tsx';

const originalWindow = Reflect.get(globalThis, 'window') as Window | undefined;
const originalDocument = Reflect.get(globalThis, 'document') as
  | Document
  | undefined;

afterEach(() => {
  if (originalWindow) {
    Reflect.set(globalThis, 'window', originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, 'window');
  }

  if (originalDocument) {
    Reflect.set(globalThis, 'document', originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, 'document');
  }
});

describe('DashboardSectionNav helpers', () => {
  test('builds section hashes', () => {
    expect(dashboardSectionHref('dashboard-projects')).toBe(
      '#dashboard-projects',
    );
  });

  test('updates the dashboard hash before scrolling to a section', () => {
    const scrollCalls: ScrollIntoViewOptions[] = [];
    const fakeWindow = {
      history: {
        pushState: (_state: unknown, _title: string, nextUrl: string | URL) => {
          fakeWindow.location = new URL(
            String(nextUrl),
            fakeWindow.location.href,
          );
        },
      },
      location: new URL('https://moddery.test/dashboard'),
    };
    const fakeDocument = {
      getElementById: (id: string) =>
        id === 'dashboard-projects'
          ? {
              scrollIntoView: (options?: boolean | ScrollIntoViewOptions) => {
                if (typeof options === 'object') {
                  scrollCalls.push(options);
                }
              },
            }
          : null,
    };

    Reflect.set(globalThis, 'window', fakeWindow as unknown as Window);
    Reflect.set(globalThis, 'document', fakeDocument as unknown as Document);

    scrollToDashboardSection('dashboard-projects');

    expect(fakeWindow.location.href).toBe(
      'https://moddery.test/dashboard#dashboard-projects',
    );
    expect(scrollCalls).toEqual([{ behavior: 'smooth', block: 'start' }]);
  });
});
