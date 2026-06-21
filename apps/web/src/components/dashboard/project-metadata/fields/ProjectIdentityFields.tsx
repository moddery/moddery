import { DashboardField } from '../shared.tsx';
import { FileDropzone } from '../../../ui/dashboard/index.ts';
import { type ProjectMetadataFieldsProps } from '../ProjectMetadataFields.types.ts';

export function ProjectIdentityFields({
  color,
  disabled,
  iconFile,
  onColorChange,
  onIconFileChange,
  onSummaryChange,
  onTitleChange,
  summary,
  title,
}: Pick<
  ProjectMetadataFieldsProps,
  | 'color'
  | 'disabled'
  | 'iconFile'
  | 'onColorChange'
  | 'onIconFileChange'
  | 'onSummaryChange'
  | 'onTitleChange'
  | 'summary'
  | 'title'
>) {
  return (
    <>
      <DashboardField
        disabled={disabled}
        label="Title"
        value={title}
        onChange={onTitleChange}
        required
      />
      <FileDropzone
        accept="image/png,image/jpeg,image/gif,image/webp"
        disabled={disabled}
        file={iconFile}
        label="Icon"
        onFileChange={onIconFileChange}
      />
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
