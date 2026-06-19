import { useRef } from 'react';

import { DashboardField } from '../shared.tsx';
import { type PublishVersionFieldsProps } from './PublishVersionFields.types.ts';

type FileFieldsProps = Pick<
  PublishVersionFieldsProps,
  | 'disabled'
  | 'fileName'
  | 'fileSize'
  | 'fileUrl'
  | 'hasLocalFile'
  | 'sha1'
  | 'sha256'
  | 'onFileNameChange'
  | 'onFileSizeChange'
  | 'onFileUrlChange'
  | 'onLocalFileChange'
  | 'onSha1Change'
  | 'onSha256Change'
>;

export function PublishVersionFileFields({
  disabled,
  fileName,
  fileSize,
  fileUrl,
  hasLocalFile,
  sha1,
  sha256,
  onFileNameChange,
  onFileSizeChange,
  onFileUrlChange,
  onLocalFileChange,
  onSha1Change,
  onSha256Change,
}: FileFieldsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function clearLocalFile() {
    if (fileInputRef.current !== null) {
      fileInputRef.current.value = '';
    }
    onLocalFileChange(null);
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-[1fr_2fr_10rem]">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Local file
          <input
            ref={fileInputRef}
            disabled={disabled}
            type="file"
            onChange={(event) =>
              onLocalFileChange(event.target.files?.[0] ?? null)
            }
            className="h-10 rounded-lg border border-line bg-control px-3 py-2 text-sm font-bold text-ink outline-none transition-colors file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1 file:text-xs file:font-bold file:text-white hover:border-line-strong focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
        {hasLocalFile && (
          <div className="flex items-end">
            <button
              type="button"
              disabled={disabled}
              onClick={clearLocalFile}
              className="h-10 rounded-lg border border-line px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear file
            </button>
          </div>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_2fr_10rem]">
        <DashboardField
          disabled={disabled || hasLocalFile}
          label="File name"
          value={fileName}
          onChange={onFileNameChange}
          required
        />
        <DashboardField
          disabled={disabled || hasLocalFile}
          label="File URL"
          value={fileUrl}
          onChange={onFileUrlChange}
          required={!hasLocalFile}
        />
        <DashboardField
          disabled={disabled || hasLocalFile}
          label="Size bytes"
          value={fileSize}
          onChange={onFileSizeChange}
          required
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <DashboardField
          disabled={disabled || hasLocalFile}
          label="SHA-1"
          value={sha1}
          onChange={onSha1Change}
        />
        <DashboardField
          disabled={disabled || hasLocalFile}
          label="SHA-256"
          value={sha256}
          onChange={onSha256Change}
        />
      </div>
    </>
  );
}
