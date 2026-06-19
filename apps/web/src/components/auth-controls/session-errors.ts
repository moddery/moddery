interface GraphqlErrorLike {
  readonly extensions?: {
    readonly code?: unknown;
    readonly originalError?: {
      readonly statusCode?: unknown;
    };
  };
  readonly message?: unknown;
}

interface NetworkErrorLike {
  readonly result?: {
    readonly errors?: readonly GraphqlErrorLike[];
  };
  readonly status?: unknown;
  readonly statusCode?: unknown;
}

interface ApolloErrorLike {
  readonly graphQLErrors?: readonly GraphqlErrorLike[];
  readonly message?: unknown;
  readonly networkError?: NetworkErrorLike | null;
}

export function isRejectedAuthSessionError(error: unknown): boolean {
  if (!isObject(error)) return false;

  const apolloError = error as ApolloErrorLike;

  const graphQLErrors = [
    ...(apolloError.graphQLErrors ?? []),
    ...(apolloError.networkError?.result?.errors ?? []),
  ];

  return (
    isUnauthorizedStatus(apolloError.networkError?.status) ||
    isUnauthorizedStatus(apolloError.networkError?.statusCode) ||
    graphQLErrors.some(isUnauthorizedGraphqlError) ||
    isUnauthorizedMessage(apolloError.message)
  );
}

function isUnauthorizedGraphqlError(error: GraphqlErrorLike): boolean {
  return (
    error.extensions?.code === 'UNAUTHENTICATED' ||
    isUnauthorizedStatus(error.extensions?.originalError?.statusCode) ||
    isUnauthorizedMessage(error.message)
  );
}

function isUnauthorizedStatus(status: unknown): boolean {
  return status === 401;
}

function isUnauthorizedMessage(message: unknown): boolean {
  if (typeof message !== 'string') return false;

  const normalized = message.toLowerCase();
  return (
    normalized.includes('invalid bearer token') ||
    normalized.includes('unauthorized')
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
