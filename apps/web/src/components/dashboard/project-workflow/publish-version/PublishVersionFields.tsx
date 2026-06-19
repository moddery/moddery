import { PublishVersionChangelogField } from './PublishVersionChangelogField.tsx';
import { PublishVersionFileFields } from './PublishVersionFileFields.tsx';
import { type PublishVersionFieldsProps } from './PublishVersionFields.types.ts';
import { PublishVersionMetadataFields } from './PublishVersionMetadataFields.tsx';

export function PublishVersionFields({
  channel,
  changelog,
  disabled,
  fileName,
  fileSize,
  fileUrl,
  gameVersionOptions,
  gameVersions,
  hasLocalFile,
  loaders,
  name,
  projectSlug,
  projects,
  sha1,
  sha256,
  versionNumber,
  onChannelChange,
  onChangelogChange,
  onFileNameChange,
  onFileSizeChange,
  onFileUrlChange,
  onLocalFileChange,
  onGameVersionsChange,
  onLoadersChange,
  onNameChange,
  onProjectSlugChange,
  onSha1Change,
  onSha256Change,
  onVersionNumberChange,
}: PublishVersionFieldsProps) {
  return (
    <>
      <PublishVersionMetadataFields
        channel={channel}
        disabled={disabled}
        gameVersionOptions={gameVersionOptions}
        gameVersions={gameVersions}
        loaders={loaders}
        name={name}
        projectSlug={projectSlug}
        projects={projects}
        versionNumber={versionNumber}
        onChannelChange={onChannelChange}
        onGameVersionsChange={onGameVersionsChange}
        onLoadersChange={onLoadersChange}
        onNameChange={onNameChange}
        onProjectSlugChange={onProjectSlugChange}
        onVersionNumberChange={onVersionNumberChange}
      />
      <PublishVersionFileFields
        fileName={fileName}
        fileSize={fileSize}
        fileUrl={fileUrl}
        disabled={disabled}
        hasLocalFile={hasLocalFile}
        sha1={sha1}
        sha256={sha256}
        onFileNameChange={onFileNameChange}
        onFileSizeChange={onFileSizeChange}
        onFileUrlChange={onFileUrlChange}
        onLocalFileChange={onLocalFileChange}
        onSha1Change={onSha1Change}
        onSha256Change={onSha256Change}
      />
      <PublishVersionChangelogField
        changelog={changelog}
        disabled={disabled}
        onChangelogChange={onChangelogChange}
      />
    </>
  );
}
