import { recordDownload } from './api/engagement.js';
import { type DownloadRecord, type ProjectVersion } from './types.js';

type ProjectFile = ProjectVersion['files'][number];

export interface DownloadProjectFileOptions {
  file: ProjectFile;
  navigate?: (url: string) => void;
  onRecorded: (record: DownloadRecord) => void;
  onRecordError?: (error: unknown) => void;
  record?: (fileId: string) => Promise<DownloadRecord>;
}

export function downloadProjectFile({
  file,
  navigate = defaultNavigate,
  onRecorded,
  onRecordError = defaultRecordError,
  record = recordDownload,
}: DownloadProjectFileOptions): void {
  try {
    void record(file.id).then(onRecorded).catch(onRecordError);
  } catch (error: unknown) {
    onRecordError(error);
  } finally {
    navigate(file.url);
  }
}

function defaultNavigate(url: string): void {
  window.location.assign(url);
}

function defaultRecordError(error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(error);
  }
}
