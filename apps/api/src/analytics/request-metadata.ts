import { type IncomingHttpHeaders } from 'node:http';

export interface AnalyticsRequestMetadata {
  countryCode?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
}

export interface AnalyticsRequest {
  headers: IncomingHttpHeaders;
}

export function analyticsRequestMetadata(
  request: AnalyticsRequest | null | undefined,
): AnalyticsRequestMetadata {
  const userAgent = headerValue(request?.headers, 'user-agent');
  const referrer =
    headerValue(request?.headers, 'referer') ??
    headerValue(request?.headers, 'referrer');
  const countryCode = normalizeCountryCode(
    headerValue(request?.headers, 'cf-ipcountry') ??
      headerValue(request?.headers, 'x-vercel-ip-country') ??
      headerValue(request?.headers, 'x-country-code'),
  );

  return {
    countryCode,
    referrer,
    userAgent,
  };
}

function headerValue(
  headers: IncomingHttpHeaders | undefined,
  name: string,
): string | null {
  const value = headers?.[name];

  if (Array.isArray(value)) {
    return cleanHeaderValue(value[0]);
  }

  return cleanHeaderValue(value);
}

function cleanHeaderValue(value: string | undefined): string | null {
  const cleaned = value?.trim();
  return cleaned === undefined || cleaned.length === 0 ? null : cleaned;
}

function normalizeCountryCode(value: string | null): string | null {
  if (value?.length !== 2) {
    return null;
  }

  return value.toUpperCase();
}
