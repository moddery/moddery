import { DashboardField } from '../shared.tsx';
import { type ProjectMetadataFieldsProps } from '../ProjectMetadataFields.types.ts';

export function ProjectLicenseFields({
  disabled,
  licenseKey,
  licenseName,
  licenseUrl,
  licenses,
  onLicenseKeyChange,
  onLicenseNameChange,
  onLicenseUrlChange,
  onLicenseSelect,
}: Pick<
  ProjectMetadataFieldsProps,
  | 'licenseKey'
  | 'disabled'
  | 'licenseName'
  | 'licenseUrl'
  | 'licenses'
  | 'onLicenseKeyChange'
  | 'onLicenseNameChange'
  | 'onLicenseUrlChange'
  | 'onLicenseSelect'
>) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <DashboardField
          disabled={disabled}
          label="License key"
          list="dashboard-license-options"
          value={licenseKey}
          onChange={(value) => {
            onLicenseKeyChange(value);
            onLicenseSelect(value);
          }}
          required
        />
        <DashboardField
          disabled={disabled}
          label="License name"
          value={licenseName}
          onChange={onLicenseNameChange}
          required
        />
        <DashboardField
          disabled={disabled}
          label="License URL"
          value={licenseUrl}
          onChange={onLicenseUrlChange}
        />
      </div>
      <datalist id="dashboard-license-options">
        {licenses.map((license) => (
          <option key={license.key} value={license.key}>
            {license.name}
          </option>
        ))}
      </datalist>
    </>
  );
}
