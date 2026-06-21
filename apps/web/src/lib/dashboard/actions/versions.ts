import { apolloClient } from '../../../apollo.js';
import {
  CREATE_VERSION_MUTATION,
  VIEWER_PROJECT_VERSION_SEARCH_QUERY,
  UPDATE_VERSION_MUTATION,
  UPDATE_VERSION_DEPENDENCIES_MUTATION,
  RECORD_FILE_SCAN_MUTATION,
  SCAN_VERSION_FILE_MUTATION,
} from '../graphql.js';
import {
  type CreateVersionMutationData,
  type CreateVersionMutationVariables,
  type UpdateVersionMutationData,
  type UpdateVersionMutationVariables,
  type UpdateVersionDependenciesMutationData,
  type ViewerProjectVersionSearchQueryData,
  type ViewerProjectVersionSearchQueryVariables,
  type RecordFileScanMutationData,
  type RecordFileScanMutationVariables,
  type ScanVersionFileMutationData,
  type ScanVersionFileMutationVariables,
  type UpdateVersionDependenciesMutationVariables,
} from '../internal-types.js';
import {
  type CreateVersionInput,
  type DashboardVersion,
  type DashboardVersionSearchResult,
  type UpdateVersionDependenciesInput,
  type UpdateVersionInput,
} from '../types.js';

export async function createVersion(
  input: CreateVersionInput,
): Promise<DashboardVersion> {
  const { data } = await apolloClient.mutate<
    CreateVersionMutationData,
    CreateVersionMutationVariables
  >({
    mutation: CREATE_VERSION_MUTATION,
    variables: { input },
  });

  if (!data?.createVersion) {
    throw new Error('Version creation did not return a version');
  }

  return data.createVersion;
}

export async function fetchManagedProjectVersions(
  projectSlug: string,
  page = 1,
  limit = 100,
  signal?: AbortSignal,
): Promise<DashboardVersionSearchResult> {
  const { data } = await apolloClient.query<
    ViewerProjectVersionSearchQueryData,
    ViewerProjectVersionSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: VIEWER_PROJECT_VERSION_SEARCH_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
      projectSlug,
    },
  });

  return data.viewerProjectVersionSearch;
}

export async function updateVersion(
  input: UpdateVersionInput,
): Promise<DashboardVersion> {
  const { data } = await apolloClient.mutate<
    UpdateVersionMutationData,
    UpdateVersionMutationVariables
  >({
    mutation: UPDATE_VERSION_MUTATION,
    variables: { input },
  });

  if (!data?.updateVersion) {
    throw new Error('Version update did not return a version');
  }

  return data.updateVersion;
}

export async function updateVersionDependencies(
  input: UpdateVersionDependenciesInput,
): Promise<DashboardVersion> {
  const { data } = await apolloClient.mutate<
    UpdateVersionDependenciesMutationData,
    UpdateVersionDependenciesMutationVariables
  >({
    mutation: UPDATE_VERSION_DEPENDENCIES_MUTATION,
    variables: { input },
  });

  if (!data?.updateVersionDependencies) {
    throw new Error('Version dependencies did not return a version');
  }

  return data.updateVersionDependencies;
}

export async function recordFileScan(input: {
  details: string | null;
  fileId: string;
  status: string;
  verdict: string | null;
}): Promise<DashboardVersion> {
  const { data } = await apolloClient.mutate<
    RecordFileScanMutationData,
    RecordFileScanMutationVariables
  >({
    mutation: RECORD_FILE_SCAN_MUTATION,
    variables: { input },
  });

  if (!data?.recordFileScan) {
    throw new Error('File scan did not return a version');
  }

  return data.recordFileScan;
}

export async function scanVersionFile(
  fileId: string,
): Promise<DashboardVersion> {
  const { data } = await apolloClient.mutate<
    ScanVersionFileMutationData,
    ScanVersionFileMutationVariables
  >({
    mutation: SCAN_VERSION_FILE_MUTATION,
    variables: { fileId },
  });

  if (!data?.scanVersionFile) {
    throw new Error('File scan did not return a version');
  }

  return data.scanVersionFile;
}
