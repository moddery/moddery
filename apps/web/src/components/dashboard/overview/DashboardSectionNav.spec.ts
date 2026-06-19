import { afterEach, describe, expect, test } from 'bun:test';

import {
  dashboardSectionHref,
  scrollToDashboardSection,
} from './DashboardSectionNav.tsx';
import { dashboardSectionItems } from './dashboardSectionItems.ts';

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
  test('builds viewer section items with counts', () => {
    expect(
      dashboardSectionItems({
        canModerate: false,
        collectionCount: 3,
        organizationCount: 2,
        projectCount: 5,
      }),
    ).toEqual([
      { id: 'dashboard-account', label: 'Account' },
      { id: 'dashboard-security', label: 'Security' },
      {
        count: 2,
        id: 'dashboard-content',
        label: 'Organizations',
      },
      { count: 5, id: 'dashboard-projects', label: 'Projects' },
      {
        count: 3,
        id: 'dashboard-collections',
        label: 'Collections',
      },
      { id: 'dashboard-overview', label: 'Overview' },
    ]);
  });

  test('places moderation before overview for moderators', () => {
    expect(
      dashboardSectionItems({
        canModerate: true,
        collectionCount: 0,
        organizationCount: 0,
        projectCount: 0,
      }).map((item) => item.id),
    ).toEqual([
      'dashboard-account',
      'dashboard-security',
      'dashboard-content',
      'dashboard-projects',
      'dashboard-collections',
      'dashboard-moderation',
      'dashboard-overview',
    ]);
  });

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
