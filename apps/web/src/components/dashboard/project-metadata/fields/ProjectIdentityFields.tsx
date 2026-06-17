import { DashboardField } from '../shared.tsx';
import { type ProjectMetadataFieldsProps } from '../ProjectMetadataFields.types.ts';

export function ProjectIdentityFields({
  color,
  iconUrl,
  onColorChange,
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
