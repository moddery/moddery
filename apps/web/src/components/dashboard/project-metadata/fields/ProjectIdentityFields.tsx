import { useRef } from 'react';

import { DashboardField } from '../shared.tsx';
import { type ProjectMetadataFieldsProps } from '../ProjectMetadataFields.types.ts';

export function ProjectIdentityFields({
  color,
  disabled,
  hasLocalIconFile,
  iconUrl,
  onColorChange,
  onIconFileChange,
  onIconUrlChange,
  onSummaryChange,
  onTitleChange,
  summary,
  title,
}: Pick<
  ProjectMetadataFieldsProps,
  | 'color'
  | 'disabled'
  | 'hasLocalIconFile'
  | 'iconUrl'
  | 'onColorChange'
  | 'onIconFileChange'
  | 'onIconUrlChange'
  | 'onSummaryChange'
  | 'onTitleChange'
  | 'summary'
  | 'title'
>) {
  const iconInputRef = useRef<HTMLInputElement>(null);

  function clearLocalIcon() {
    if (iconInputRef.current !== null) {
      iconInputRef.current.value = '';
    }
    onIconFileChange(null);
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        <DashboardField
          disabled={disabled}
          label="Title"
          value={title}
          onChange={onTitleChange}
          required
        />
        <DashboardField
          disabled={disabled || hasLocalIconFile}
          label="Icon URL"
          value={iconUrl}
          onChange={onIconUrlChange}
        />
      </div>
      <label className="grid gap-1 text-sm font-bold text-ink">
        Local icon
        <input
          ref={iconInputRef}
          disabled={disabled}
          type="file"
          accept="image/*"
          onChange={(event) =>
            onIconFileChange(event.target.files?.[0] ?? null)
          }
          className="h-10 rounded-lg border border-line bg-control px-3 py-2 text-sm font-bold text-ink outline-none transition-colors file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1 file:text-xs file:font-bold file:text-white hover:border-line-strong focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
      {hasLocalIconFile && (
        <div className="flex">
          <button
            type="button"
            disabled={disabled}
            onClick={clearLocalIcon}
            className="h-10 rounded-lg border border-line px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear icon
          </button>
        </div>
      )}
      <DashboardField
        disabled={disabled}
        label="Color"
        value={color}
        onChange={onColorChange}
      />
      <DashboardField
        disabled={disabled}
        label="Summary"
        value={summary}
        onChange={onSummaryChange}
        required
      />
    </>
  );
}
