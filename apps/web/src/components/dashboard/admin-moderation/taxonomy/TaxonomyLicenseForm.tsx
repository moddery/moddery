import { type FormEvent } from 'react';

import { type LicenseTaxonomy } from '../../../../lib/dashboard.ts';
import { DashboardField } from '../shared.tsx';

export function TaxonomyLicenseForm({
  busy,
  licenseKey,
  licenseName,
  licenseUrl,
  licenses,
  onLicenseKeyChange,
  onLicenseNameChange,
  onLicenseUrlChange,
  onSelect,
  onSubmit,
}: {
  busy: boolean;
  licenseKey: string;
  licenseName: string;
  licenseUrl: string;
  licenses: LicenseTaxonomy[];
  onLicenseKeyChange: (value: string) => void;
  onLicenseNameChange: (value: string) => void;
  onLicenseUrlChange: (value: string) => void;
  onSelect: (license: LicenseTaxonomy) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid content-start gap-3">
      <h3 className="font-display text-base font-extrabold text-ink">
        License
      </h3>
      <div className="grid gap-3 md:grid-cols-2">
        <DashboardField
          label="Key"
          value={licenseKey}
          onChange={onLicenseKeyChange}
          required
        />
        <DashboardField
          label="Name"
          value={licenseName}
          onChange={onLicenseNameChange}
          required
        />
      </div>
      <DashboardField
        label="URL"
        value={licenseUrl}
        onChange={onLicenseUrlChange}
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        Save license
      </button>
      <TaxonomyLicenseList licenses={licenses} onSelect={onSelect} />
    </form>
  );
}

function TaxonomyLicenseList({
  licenses,
  onSelect,
}: {
  licenses: LicenseTaxonomy[];
  onSelect: (license: LicenseTaxonomy) => void;
}) {
  if (licenses.length === 0) {
    return <p className="text-sm font-semibold text-muted">No licenses yet.</p>;
  }

  return (
    <div className="mt-1 grid gap-2">
      {licenses.slice(0, 12).map((license) => (
        <button
          key={license.key}
          type="button"
          onClick={() => onSelect(license)}
          className="flex items-center justify-between gap-3 rounded-lg border border-line bg-control px-3 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-control-hover"
        >
          <span>{license.name}</span>
          <span className="text-xs text-muted">{license.key}</span>
        </button>
      ))}
    </div>
  );
}
