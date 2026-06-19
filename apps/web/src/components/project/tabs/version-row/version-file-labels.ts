import { type ProjectVersion } from '../../../../lib/catalog.ts';
import { shortHash } from './helpers.ts';

type VersionFile = ProjectVersion['files'][number];

export function fileKindLabel(kind: VersionFile['kind']): string {
  if (kind === 'CLIENT') return 'Client';
  if (kind === 'SERVER') return 'Server';
  return 'Universal';
}

export function fileHashPreview(
  hashes: VersionFile['hashes'],
  limit = 3,
): string[] {
  return hashes
    .slice(0, limit)
    .map((hash) => `${hash.algorithm} ${shortHash(hash.value)}`);
}
