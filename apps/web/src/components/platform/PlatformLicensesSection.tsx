import { ExternalLink, Search } from 'lucide-react';

import { type PlatformLicense } from '../../lib/catalog.ts';
import { buildPlatformDiscoverHref } from './platformDiscoverHref.ts';
import { PlatformSectionHeader } from './PlatformSectionHeader.tsx';

export function PlatformLicensesSection({
  licenses,
}: {
  licenses: PlatformLicense[];
}) {
  return (
    <section>
      <PlatformSectionHeader
        title="Licenses"
        subtitle="Known license options available for published projects."
      />
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {licenses.map((license) => (
          <div
            key={license.key}
            className="rounded-lg border border-line bg-surface p-3 text-sm transition-colors hover:border-line-strong hover:bg-surface-2"
          >
            <a
              href={buildPlatformDiscoverHref({ license: license.key })}
              className="flex items-center justify-between gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <LicenseText license={license} />
              <Search className="size-4 shrink-0 text-accent-icon" />
            </a>
            {license.url && (
              <a
                href={license.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-accent transition-colors hover:text-accent-strong"
              >
                License text
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function LicenseText({ license }: { license: PlatformLicense }) {
  return (
    <span>
      <span className="block font-bold text-ink">{license.name}</span>
      <span className="mt-1 block text-xs font-semibold text-muted">
        {license.key}
      </span>
    </span>
  );
}
