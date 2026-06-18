import {
  type CreateVersionInput,
  type DashboardData,
} from '../../../../lib/dashboard.ts';

export interface PublishVersionFieldsProps {
  channel: CreateVersionInput['channel'];
  changelog: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  gameVersions: string;
  hasLocalFile: boolean;
  loaders: string;
  name: string;
  projectSlug: string;
  projects: DashboardData['projects'];
  sha1: string;
  sha256: string;
  versionNumber: string;
  onChannelChange: (value: CreateVersionInput['channel']) => void;
  onChangelogChange: (value: string) => void;
  onFileNameChange: (value: string) => void;
  onFileSizeChange: (value: string) => void;
  onFileUrlChange: (value: string) => void;
  onLocalFileChange: (value: File | null) => void;
  onGameVersionsChange: (value: string) => void;
  onLoadersChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onProjectSlugChange: (value: string) => void;
  onSha1Change: (value: string) => void;
  onSha256Change: (value: string) => void;
  onVersionNumberChange: (value: string) => void;
}
