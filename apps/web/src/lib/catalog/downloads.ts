import { graphqlUri } from '../../apollo.js';
import { type ProjectVersion } from './types.js';

type ProjectFile = ProjectVersion['files'][number];

export interface DownloadProjectFileOptions {
  file: ProjectFile;
  navigate?: (url: string) => void;
}

export function downloadProjectFile({
  file,
  navigate = defaultNavigate,
}: DownloadProjectFileOptions): void {
  navigate(downloadUrlForFile(file.id));
}

export function downloadUrlForFile(fileId: string): string {
  return new URL(
    `/downloads/files/${encodeURIComponent(fileId)}`,
    graphqlUri,
  ).toString();
}

function defaultNavigate(url: string): void {
  window.location.assign(url);
}
