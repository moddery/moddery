import { UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '../../../lib/cn.ts';

export interface FileDropzoneProps {
  accept?: string;
  disabled?: boolean;
  existingPreviewUrl?: string | null;
  file: File | null;
  label: string;
  onFileChange: (file: File | null) => void;
  previewKind?: 'image' | 'file';
}

export function FileDropzone({
  accept,
  disabled = false,
  existingPreviewUrl,
  file,
  label,
  onFileChange,
  previewKind = 'image',
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file === null || previewKind !== 'image') {
      setObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, previewKind]);

  function acceptFiles(fileList: FileList | null) {
    const next = fileList?.item(0) ?? null;
    if (next === null) return;
    if (!isFileAccepted(next, accept)) return;
    onFileChange(next);
  }

  const previewUrl = objectUrl ?? existingPreviewUrl ?? null;

  return (
    <div className="grid gap-1 text-sm font-bold text-ink">
      <span>{label}</span>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => {
          if (!disabled) inputRef.current?.click();
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          if (disabled) return;
          event.preventDefault();
          setDragging(false);
          acceptFiles(event.dataTransfer.files);
        }}
        className={cn(
          'flex items-center gap-3 rounded-lg border border-dashed border-line bg-control px-3 py-3 text-left outline-none transition-colors',
          !disabled && 'cursor-pointer hover:border-line-strong',
          dragging && 'border-accent bg-control-hover',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="size-12 shrink-0 rounded-md border border-line object-cover"
          />
        ) : (
          <span className="grid size-12 shrink-0 place-items-center rounded-md border border-line bg-surface-2 text-muted">
            <UploadCloud className="size-5" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          {file ? (
            <>
              <span className="block truncate text-sm font-bold text-ink">
                {file.name}
              </span>
              <span className="block text-xs font-semibold text-muted">
                {formatFileSize(file.size)}
              </span>
            </>
          ) : (
            <span className="block text-sm font-semibold text-muted">
              Drag &amp; drop or click to browse
            </span>
          )}
        </div>

        {file && (
          <button
            type="button"
            aria-label="Remove file"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              onFileChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          className="hidden"
          onChange={(event) => acceptFiles(event.target.files)}
        />
      </div>
    </div>
  );
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  const rounded = exponent === 0 ? value : Math.round(value * 10) / 10;

  return `${String(rounded)} ${units[exponent]}`;
}

export function isFileAccepted(file: File, accept?: string): boolean {
  if (!accept) return true;

  const patterns = accept
    .split(',')
    .map((pattern) => pattern.trim().toLowerCase())
    .filter((pattern) => pattern.length > 0);
  if (patterns.length === 0) return true;

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  return patterns.some((pattern) => {
    if (pattern.startsWith('.')) return fileName.endsWith(pattern);
    if (pattern.endsWith('/*')) {
      return fileType.startsWith(`${pattern.slice(0, -1)}`);
    }
    return fileType === pattern;
  });
}
