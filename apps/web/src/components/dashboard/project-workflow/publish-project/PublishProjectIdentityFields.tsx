import { DashboardField } from '../shared.tsx';
import { type PublishProjectFieldsProps } from './PublishProjectFields.types.ts';

type IdentityFieldsProps = Pick<
  PublishProjectFieldsProps,
  | 'color'
  | 'description'
  | 'iconUrl'
  | 'slug'
  | 'summary'
  | 'title'
  | 'onColorChange'
  | 'onDescriptionChange'
  | 'onIconFileChange'
  | 'onIconUrlChange'
  | 'onSlugChange'
  | 'onSummaryChange'
  | 'onTitleChange'
>;

export function PublishProjectIdentityFields({
  color,
  description,
  iconUrl,
  slug,
  summary,
  title,
  onColorChange,
  onDescriptionChange,
  onIconFileChange,
  onIconUrlChange,
  onSlugChange,
  onSummaryChange,
  onTitleChange,
}: IdentityFieldsProps) {
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
          label="Slug"
          value={slug}
          onChange={onSlugChange}
          required
        />
      </div>
      <DashboardField
        label="Summary"
        value={summary}
        onChange={onSummaryChange}
        required
      />
      <div className="grid gap-3 md:grid-cols-2">
        <DashboardField
          label="Icon URL"
          value={iconUrl}
          onChange={onIconUrlChange}
        />
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
      </div>
      <DashboardField label="Color" value={color} onChange={onColorChange} />
      <label className="grid gap-1 text-sm font-bold text-ink">
        Description
        <textarea
          required
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          className="min-h-28 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
        />
      </label>
    </>
  );
}
