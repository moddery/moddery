import { DashboardField } from '../shared.tsx';
import { type ProjectMetadataFieldsProps } from '../ProjectMetadataFields.types.ts';

export function ProjectIdentityFields({
  iconUrl,
  onIconUrlChange,
  onSummaryChange,
  onTitleChange,
  summary,
  title,
}: Pick<
  ProjectMetadataFieldsProps,
  | 'iconUrl'
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
      <DashboardField
        label="Summary"
        value={summary}
        onChange={onSummaryChange}
        required
      />
    </>
  );
}
