import { apolloClient } from '../../../../apollo.js';
import {
  CREATE_DIRECT_THREAD_MESSAGE_MUTATION,
  CREATE_DIRECT_THREAD_MUTATION,
  VIEWER_DIRECT_THREADS_QUERY,
} from '../../graphql.js';
import {
  type CreateDirectThreadMessageMutationData,
  type CreateDirectThreadMessageMutationVariables,
  type CreateDirectThreadMutationData,
  type CreateDirectThreadMutationVariables,
  type ViewerDirectThreadsQueryData,
  type ViewerDirectThreadsQueryVariables,
} from '../../internal-types.js';
import {
  type DirectThread,
  type DirectThreadSearchResult,
} from '../../types.js';

export async function fetchViewerDirectThreads(
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<DirectThreadSearchResult> {
  const { data } = await apolloClient.query<
    ViewerDirectThreadsQueryData,
    ViewerDirectThreadsQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_DIRECT_THREADS_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
    },
  });

  return data.viewerDirectThreadSearch;
}

export async function createDirectThread(input: {
  body: string;
  username: string;
}): Promise<DirectThread> {
  const { data } = await apolloClient.mutate<
    CreateDirectThreadMutationData,
    CreateDirectThreadMutationVariables
  >({
    mutation: CREATE_DIRECT_THREAD_MUTATION,
    variables: { input },
  });

  if (!data?.createDirectThread) {
    throw new Error('Direct thread did not return from the API');
  }

  return data.createDirectThread;
}

export async function createDirectThreadMessage(input: {
  body: string;
  threadId: string;
}): Promise<DirectThread> {
  const { data } = await apolloClient.mutate<
    CreateDirectThreadMessageMutationData,
    CreateDirectThreadMessageMutationVariables
  >({
    mutation: CREATE_DIRECT_THREAD_MESSAGE_MUTATION,
    variables: { input },
  });

  if (!data?.createDirectThreadMessage) {
    throw new Error('Direct thread message did not return from the API');
  }

  return data.createDirectThreadMessage;
}
