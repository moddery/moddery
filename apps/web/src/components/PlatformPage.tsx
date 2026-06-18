import { type ProjectKind } from '@moddery/shared';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';

import {
  fetchPlatformMetadata,
  type CategoryFilterTag,
  type PlatformLicense,
} from '../lib/catalog.ts';
import {
  CONTENT_TYPES,
  projectKindFromType,
  projectTypeMeta,
} from '../lib/projectTypes.ts';
import { CategoryTag, loaderLabel, LoaderTag } from './Chips.tsx';

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
          <CategoriesSection categories={metadata.categories} />
          <CompatibilitySection
            gameVersions={metadata.gameVersions}
            loaders={metadata.loaders}
          />
          <LicensesSection licenses={metadata.licenses} />
        </div>
      )}
    </main>
  );
}

function CategoriesSection({
  categories,
}: {
  categories: CategoryFilterTag[];
}) {
  const globalCategories = categories.filter(
    (category) => category.projectKind === null,
  );

  return (
    <section>
      <SectionHeader
        title="Categories"
        subtitle="Project tags used for discovery and filtering."
      />
      <div className="mt-4 grid gap-5">
        {globalCategories.length > 0 && (
          <CategoryGroup
            categories={globalCategories}
            title="All project types"
          />
        )}
        {CONTENT_TYPES.map((projectType) => {
          const projectKind = projectKindFromType(projectType.type);
          const scopedCategories = categories.filter(
            (category) => category.projectKind === projectKind,
          );
          if (scopedCategories.length === 0) return null;

          return (
            <CategoryGroup
              key={projectType.type}
              categories={scopedCategories}
              projectKind={projectKind}
              title={projectType.label}
            />
          );
        })}
      </div>
    </section>
  );
}

function CategoryGroup({
  categories,
  projectKind,
  title,
}: {
  categories: CategoryFilterTag[];
  projectKind?: ProjectKind;
  title: string;
}) {
  return (
    <div>
      <h3 className="font-display text-base font-extrabold text-ink">
        {title}
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {categories.map((category) => (
          <a
            key={`${projectKind ?? 'all'}-${category.slug}`}
            href={discoverHref({
              category: category.slug,
              projectKind: category.projectKind ?? projectKind,
            })}
            className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <CategoryTag category={category.slug} />
          </a>
        ))}
      </div>
    </div>
  );
}

function CompatibilitySection({
  gameVersions,
  loaders,
}: {
  gameVersions: string[];
  loaders: string[];
}) {
  return (
    <section>
      <SectionHeader
        title="Compatibility"
        subtitle="Supported loaders and game versions available in project filters."
      />
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-base font-extrabold text-ink">
            Loaders
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {loaders.map((loader) => (
              <a
                key={loader}
                href={discoverHref({ loader })}
                className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                aria-label={`Search ${loaderLabel(loader)} projects`}
              >
                <LoaderTag loader={loader} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-display text-base font-extrabold text-ink">
            Game Versions
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {gameVersions.map((version) => (
              <a
                key={version}
                href={discoverHref({ version })}
                className="inline-flex items-center rounded-md bg-surface-2 px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-control-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {version}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LicensesSection({ licenses }: { licenses: PlatformLicense[] }) {
  return (
    <section>
      <SectionHeader
        title="Licenses"
        subtitle="Known license options available for published projects."
      />
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {licenses.map((license) =>
          license.url ? (
            <a
              key={license.key}
              href={license.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3 text-sm transition-colors hover:border-line-strong hover:bg-surface-2"
            >
              <LicenseText license={license} />
              <ExternalLink className="size-4 shrink-0 text-accent-icon" />
            </a>
          ) : (
            <div
              key={license.key}
              className="rounded-lg border border-line bg-surface p-3 text-sm"
            >
              <LicenseText license={license} />
            </div>
          ),
        )}
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

function SectionHeader({
  subtitle,
  title,
}: {
  subtitle: string;
  title: string;
}) {
  return (
    <div className="border-b border-line pb-3">
      <h2 className="font-display text-xl font-extrabold text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p>
    </div>
  );
}

function discoverHref({
  category,
  loader,
  projectKind,
  version,
}: {
  category?: string;
  loader?: string;
  projectKind?: ProjectKind | null;
  version?: string;
}) {
  const projectType =
    CONTENT_TYPES.find(
      (item) =>
        projectKind !== null &&
        projectKind !== undefined &&
        projectKindFromType(item.type) === projectKind,
    ) ?? projectTypeMeta('mod');
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (loader) params.set('loader', loader);
  if (version) params.set('version', version);

  const query = params.toString();

  return `/${projectType.path}${query ? `?${query}` : ''}`;
}
