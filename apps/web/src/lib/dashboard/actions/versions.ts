import { apolloClient } from '../../../apollo.js';
import {
  CREATE_VERSION_MUTATION,
  UPDATE_VERSION_MUTATION,
  UPDATE_VERSION_DEPENDENCIES_MUTATION,
  RECORD_FILE_SCAN_MUTATION,
} from '../graphql.js';
import {
  type CreateVersionMutationData,
  type CreateVersionMutationVariables,
  type UpdateVersionMutationData,
  type UpdateVersionMutationVariables,
  type UpdateVersionDependenciesMutationData,
  type RecordFileScanMutationData,
  type RecordFileScanMutationVariables,
  type UpdateVersionDependenciesMutationVariables,
} from '../internal-types.js';
import {
  type CreateVersionInput,
  type DashboardVersion,
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
