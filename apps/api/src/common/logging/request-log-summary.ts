import { type GraphQLResolveInfo } from 'graphql';

export interface RequestLogSummary {
  ipAddress: string | null;
  method: string | null;
  operation: string;
  path: string | null;
  transport: 'graphql' | 'http';
  userAgent: string | null;
  userId: string | null;
}

export interface RequestLike {
  readonly body?: {
    readonly operationName?: unknown;
  };
  readonly headers?: Record<string, string | string[] | undefined>;
  readonly ip?: string;
  readonly method?: string;
  readonly path?: string;
  readonly socket?: {
    readonly remoteAddress?: string;
  };
  readonly url?: string;
  readonly user?: unknown;
}

export function graphqlRequestLogSummary({
  info,
  request,
}: {
  info: GraphQLResolveInfo;
  request: RequestLike | undefined;
}): RequestLogSummary {
  return {
    ipAddress: requestIpAddress(request),
    method: 'POST',
    operation: graphqlOperationName(request, info),
    path: '/graphql',
    transport: 'graphql',
    userAgent: requestUserAgent(request),
    userId: requestUserId(request),
  };
}

export function httpRequestLogSummary(
  request: RequestLike | undefined,
): RequestLogSummary {
  return {
    ipAddress: requestIpAddress(request),
    method: request?.method ?? null,
    operation: request?.path ?? request?.url ?? 'http_request',
    path: request?.path ?? request?.url ?? null,
    transport: 'http',
    userAgent: requestUserAgent(request),
    userId: requestUserId(request),
  };
}

export function shouldSkipRequestLog(summary: RequestLogSummary): boolean {
  return summary.transport === 'http' && summary.path?.startsWith('/health/')
    ? true
    : false;
}

function graphqlOperationName(
  request: RequestLike | undefined,
  info: GraphQLResolveInfo,
): string {
  const requestOperationName = request?.body?.operationName;
  if (
    typeof requestOperationName === 'string' &&
    requestOperationName.trim().length > 0
  ) {
    return requestOperationName.trim();
  }

  const operation = info.operation;
  const operationKind = operation.operation;
  const operationName = operation.name?.value ?? info.fieldName;

  return `${operationKind}.${operationName}`;
}

function requestIpAddress(request: RequestLike | undefined): string | null {
  return firstPresent(
    firstHeader(request?.headers?.['x-forwarded-for'])?.split(',')[0],
    request?.ip,
    request?.socket?.remoteAddress,
  );
}

function requestUserAgent(request: RequestLike | undefined): string | null {
  return firstPresent(firstHeader(request?.headers?.['user-agent']));
}

function requestUserId(request: RequestLike | undefined): string | null {
  const user = request?.user;
  if (!isObjectRecord(user)) {
    return null;
  }

  const id = user.id;
  return typeof id === 'string' && id.length > 0 ? id : null;
}

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function firstPresent(...values: (string | undefined)[]): string | null {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed !== undefined && trimmed.length > 0) {
      return trimmed;
    }
  }

  return null;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
