import { type ReactNode } from 'react';
import { Clock3, PackageCheck, Tags } from 'lucide-react';

import { type ProjectVersion } from '../../../../lib/catalog.ts';
import { type ProjectType } from '../../../../types.ts';
import { formatDate, timeAgo } from '../../../../lib/format.ts';
import { enumLabel } from '../../../../lib/labels.ts';
import { Chip, LoaderTag, VersionTag } from '../../../Chips.tsx';
import { type SearchTag } from '../../../ModCard.tsx';

export function VersionMetadata({
  onTagSearch,
  projectType,
  version,
}: {
  onTagSearch?: (tag: SearchTag) => void;
  projectType: ProjectType;
  version: ProjectVersion;
}) {
  const lifecycle = [
    { label: 'Published', value: formatDate(version.datePublished) },
    { label: 'Created', value: formatDate(version.createdAt) },
    { label: 'Updated', value: timeAgo(version.updatedAt) },
    { label: 'Status', value: enumLabel(version.status) },
    version.requestedStatus
      ? {
          label: 'Requested',
          value: enumLabel(version.requestedStatus),
        }
      : null,
    { label: 'Order', value: version.sortOrder.toLocaleString('en-US') },
  ].filter((item): item is { label: string; value: string } => item !== null);

  return (
    <div className="grid gap-3 rounded-lg border border-line bg-surface px-3 py-3 lg:grid-cols-2">
      <section>
        <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase text-muted">
          <Clock3 className="size-4 text-accent-icon" />
          Release state
        </div>
        <dl className="grid gap-1 text-xs">
          {lifecycle.map((item) => (
            <div
              key={item.label}
              className="grid gap-1 sm:grid-cols-[6rem_minmax(0,1fr)]"
            >
              <dt className="font-bold text-muted">{item.label}</dt>
              <dd className="font-semibold text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase text-muted">
          <Tags className="size-4 text-accent-icon" />
          Compatibility
        </div>
        <div className="grid gap-2">
          <TagGroup label="Loaders">
            {version.loaders.map((loader) => (
              <LoaderTag
                key={loader}
                loader={loader}
                onClick={
                  onTagSearch === undefined
                    ? undefined
                    : () =>
                        onTagSearch(
                          versionCompatibilityTag(
                            'loader',
                            projectType,
                            loader,
                          ),
                        )
                }
              />
            ))}
          </TagGroup>
          <TagGroup label="Game versions">
            {version.gameVersions.map((gameVersion) => (
              <VersionTag
                key={gameVersion}
                version={gameVersion}
                onClick={
                  onTagSearch === undefined
                    ? undefined
                    : () =>
                        onTagSearch(
                          versionCompatibilityTag(
                            'version',
                            projectType,
                            gameVersion,
                          ),
                        )
                }
              />
            ))}
          </TagGroup>
          <TagGroup label="Files">
            <Chip>{version.files.length.toLocaleString('en-US')} files</Chip>
            <Chip>
              {version.files.filter((file) => file.primary).length} primary
            </Chip>
          </TagGroup>
        </div>
      </section>
    </div>
  );
}

export function versionCompatibilityTag(
  kind: Extract<SearchTag['kind'], 'loader' | 'version'>,
  projectType: ProjectType,
  value: string,
): SearchTag {
  return { kind, projectType, value };
}

function TagGroup({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="grid gap-1">
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
        <PackageCheck className="size-3.5" />
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
