import { graphqlUri } from '../apollo.ts';

export interface HealthCheckResult {
  durationMs: number | null;
  name: 'analytics' | 'database' | 'redis' | 'search' | 'storage';
  status: 'down' | 'up';
}

export interface ReadinessResult {
  checks: HealthCheckResult[];
  status: 'not_ready' | 'ready';
}

export async function fetchReadiness(
  signal?: AbortSignal,
): Promise<ReadinessResult> {
  const response = await fetch(healthUrl('/health/ready'), { signal });
  const body: unknown = await response.json();
  const result = parseReadinessResponse(body);

  if (!response.ok && result.status === 'ready') {
    throw new Error('Readiness check failed');
  }

  return result;
}

function healthUrl(pathname: string): string {
  const url = new URL(graphqlUri);
  url.pathname = pathname;
  url.search = '';
  url.hash = '';

  return url.toString();
}

function parseReadinessResponse(body: unknown): ReadinessResult {
  if (isReadinessResult(body)) return body;

  if (isRecord(body) && 'message' in body && isReadinessResult(body.message)) {
    return body.message;
  }

  throw new Error('Invalid readiness response');
}

function isReadinessResult(value: unknown): value is ReadinessResult {
  return (
    isRecord(value) &&
    (value.status === 'ready' || value.status === 'not_ready') &&
    Array.isArray(value.checks) &&
    value.checks.every(isHealthCheck)
  );
}

function isHealthCheck(value: unknown): value is HealthCheckResult {
  return (
    isRecord(value) &&
    isHealthCheckName(value.name) &&
    isHealthCheckDuration(value.durationMs) &&
    (value.status === 'up' || value.status === 'down')
  );
}

function isHealthCheckDuration(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === 'number' && Number.isFinite(value) && value >= 0)
  );
}

function isHealthCheckName(value: unknown): value is HealthCheckResult['name'] {
  return (
    value === 'analytics' ||
    value === 'database' ||
    value === 'redis' ||
    value === 'search' ||
    value === 'storage'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
