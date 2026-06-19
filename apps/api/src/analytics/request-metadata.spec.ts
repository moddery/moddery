import { describe, expect, test } from 'bun:test';

import { analyticsRequestMetadata } from './request-metadata.js';

describe(analyticsRequestMetadata.name, () => {
  test('extracts analytics headers from a request', () => {
    expect(
      analyticsRequestMetadata({
        headers: {
          'cf-ipcountry': 'us',
          referer: 'https://moddery.test/discover',
          'user-agent': 'ModderyBrowser/1.0',
        },
      }),
    ).toEqual({
      countryCode: 'US',
      referrer: 'https://moddery.test/discover',
      userAgent: 'ModderyBrowser/1.0',
    });
  });

  test('ignores blank or malformed metadata headers', () => {
    expect(
      analyticsRequestMetadata({
        headers: {
          'cf-ipcountry': 'unknown',
          referer: '   ',
          'user-agent': '',
        },
      }),
    ).toEqual({
      countryCode: null,
      referrer: null,
      userAgent: null,
    });
  });
});
