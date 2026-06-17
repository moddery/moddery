import { DashboardField } from '../shared.tsx';
import { type ProjectMetadataFieldsProps } from '../ProjectMetadataFields.types.ts';

export function ProjectLicenseFields({
  licenseKey,
  licenseName,
  licenseUrl,
  onLicenseKeyChange,
  onLicenseNameChange,
  onLicenseUrlChange,
}: Pick<
  ProjectMetadataFieldsProps,
  | 'licenseKey'
  | 'licenseName'
  | 'licenseUrl'
  | 'onLicenseKeyChange'
  | 'onLicenseNameChange'
  | 'onLicenseUrlChange'
>) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <DashboardField
        label="License key"
        value={licenseKey}
        onChange={onLicenseKeyChange}
        required
      />
      <DashboardField
        label="License name"
        value={licenseName}
        onChange={onLicenseNameChange}
        required
      />
      <DashboardField
        label="License URL"
        value={licenseUrl}
        onChange={onLicenseUrlChange}
      />
    </div>
  );
}
