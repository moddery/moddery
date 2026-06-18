import { DashboardField } from '../shared.tsx';
import { type ProjectMetadataFieldsProps } from '../ProjectMetadataFields.types.ts';

export function ProjectIdentityFields({
  color,
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
  | 'iconUrl'
  | 'onColorChange'
  | 'onIconFileChange'
  | 'onIconUrlChange'
  | 'onSummaryChange'
  | 'onTitleChange'
  | 'summary'
  | 'title'
>) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        <DashboardField
          label="Title"
          value={title}
          onChange={onTitleChange}
          required
        />
        <DashboardField
          label="Icon URL"
          value={iconUrl}
          onChange={onIconUrlChange}
        />
      </div>
      <label className="grid gap-1 text-sm font-bold text-ink">
        Local icon
        <input
          type="file"
          accept="image/*"
          onChange={(event) =>
            onIconFileChange(event.target.files?.[0] ?? null)
          }
          className="h-10 rounded-lg border border-line bg-control px-3 py-2 text-sm font-bold text-ink outline-none transition-colors file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1 file:text-xs file:font-bold file:text-white hover:border-line-strong focus-visible:border-accent"
        />
      </label>
      <DashboardField label="Color" value={color} onChange={onColorChange} />
      <DashboardField
        label="Summary"
        value={summary}
        onChange={onSummaryChange}
        required
      />
    </>
  );
}
