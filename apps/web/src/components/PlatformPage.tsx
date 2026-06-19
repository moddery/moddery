import { useQuery } from '@tanstack/react-query';

import { fetchPlatformMetadata } from '../lib/catalog.ts';
import { PlatformCategoriesSection } from './platform/PlatformCategoriesSection.tsx';
import { PlatformCompatibilitySection } from './platform/PlatformCompatibilitySection.tsx';
import { PlatformLicensesSection } from './platform/PlatformLicensesSection.tsx';

export function PlatformPage() {
  const metadataQuery = useQuery({
    queryFn: ({ signal }) => fetchPlatformMetadata(signal),
    queryKey: ['platform', 'metadata'],
  });
  const metadata = metadataQuery.data;

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <header className="border-b border-line pb-5">
        <h1 className="font-display text-3xl font-extrabold text-ink">
          Platform
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Browse supported categories, loaders, game versions, and project
          licenses.
        </p>
      </header>

      {metadataQuery.isLoading ? (
        <p className="mt-6 text-sm font-semibold text-muted">
          Loading platform metadata...
        </p>
      ) : metadataQuery.error ? (
        <p className="mt-6 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {metadataQuery.error instanceof Error
            ? metadataQuery.error.message
            : 'Platform metadata failed to load'}
        </p>
      ) : metadata === undefined ? (
        <p className="mt-6 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          Platform metadata did not return from the API.
        </p>
      ) : (
        <div className="grid gap-10 pt-8">
          <PlatformCategoriesSection categories={metadata.categories} />
          <PlatformCompatibilitySection
            gameVersions={metadata.gameVersions}
            loaders={metadata.loaders}
          />
          <PlatformLicensesSection licenses={metadata.licenses} />
        </div>
      )}
    </main>
  );
}
