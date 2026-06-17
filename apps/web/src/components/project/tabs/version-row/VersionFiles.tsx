import { type ProjectVersion } from '../../../../lib/catalog.ts';
import { VersionFileCard } from './VersionFileCard.tsx';

export function VersionFiles({
  files,
  onDownload,
}: {
  files: ProjectVersion['files'];
  onDownload: (file: ProjectVersion['files'][number]) => void;
}) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-2">
      {files.map((file) => (
        <VersionFileCard key={file.id} file={file} onDownload={onDownload} />
      ))}
    </div>
  );
}
