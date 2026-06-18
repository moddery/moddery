import { apolloClient } from '../../../apollo.js';
import { PREPARE_PROJECT_UPLOAD_MUTATION } from '../graphql.js';
import {
  type PrepareProjectUploadMutationData,
  type PrepareProjectUploadMutationVariables,
} from '../internal-types.js';
import {
  type PrepareProjectUploadInput,
  type ProjectUploadTarget,
} from '../types.js';

export async function prepareProjectUpload(
  input: PrepareProjectUploadInput,
): Promise<ProjectUploadTarget> {
  const { data } = await apolloClient.mutate<
    PrepareProjectUploadMutationData,
    PrepareProjectUploadMutationVariables
  >({
    mutation: PREPARE_PROJECT_UPLOAD_MUTATION,
    variables: { input },
  });

  if (!data?.prepareProjectUpload) {
    throw new Error('Upload preparation did not return a target');
  }

  return data.prepareProjectUpload;
}

export async function uploadProjectFile({
  file,
  projectSlug,
  uploadKind,
}: {
  file: File;
  projectSlug: string;
  uploadKind: PrepareProjectUploadInput['uploadKind'];
}): Promise<ProjectUploadTarget> {
  const target = await prepareProjectUpload({
    contentType: file.type || null,
    fileName: file.name,
    projectSlug,
    sizeBytes: file.size,
    uploadKind,
  });

  const response = await fetch(target.uploadUrl, {
    body: file,
    headers: file.type ? { 'Content-Type': file.type } : undefined,
    method: target.method,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${String(response.status)}`);
  }

  return target;
}
