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

export async function computeVersionFileHashes(
  file: File,
): Promise<{ algorithm: string; value: string }[]> {
  const bytes = await file.arrayBuffer();
  const [sha1, sha256] = await Promise.all([
    crypto.subtle.digest('SHA-1', bytes),
    crypto.subtle.digest('SHA-256', bytes),
  ]);

  return [
    { algorithm: 'SHA1', value: digestToHex(sha1) },
    { algorithm: 'SHA256', value: digestToHex(sha256) },
  ];
}

function digestToHex(digest: ArrayBuffer): string {
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
