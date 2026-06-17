import { DashboardField } from '../shared.tsx';
import { type PublishVersionFieldsProps } from './PublishVersionFields.types.ts';

type FileFieldsProps = Pick<
  PublishVersionFieldsProps,
  | 'fileName'
  | 'fileSize'
  | 'fileUrl'
  | 'sha1'
  | 'sha256'
  | 'onFileNameChange'
  | 'onFileSizeChange'
  | 'onFileUrlChange'
  | 'onSha1Change'
  | 'onSha256Change'
>;

export function PublishVersionFileFields({
  fileName,
  fileSize,
  fileUrl,
  sha1,
  sha256,
  onFileNameChange,
  onFileSizeChange,
  onFileUrlChange,
  onSha1Change,
  onSha256Change,
}: FileFieldsProps) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-[1fr_2fr_10rem]">
        <DashboardField
          label="File name"
          value={fileName}
          onChange={onFileNameChange}
          required
        />
        <DashboardField
          label="File URL"
          value={fileUrl}
          onChange={onFileUrlChange}
          required
        />
        <DashboardField
          label="Size bytes"
          value={fileSize}
          onChange={onFileSizeChange}
          required
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <DashboardField label="SHA-1" value={sha1} onChange={onSha1Change} />
        <DashboardField
          label="SHA-256"
          value={sha256}
          onChange={onSha256Change}
        />
      </div>
    </>
  );
}
