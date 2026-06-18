import {
  type DashboardCollection,
  type DashboardOrganization,
} from '../../../lib/dashboard.ts';
import {
  collectionPath,
  organizationPath,
  projectPath,
  type SelectedProject,
} from '../../../app/routing.ts';
import { timeAgo } from '../../../lib/format.ts';
import { projectTypeFromKind } from '../../../lib/projectTypes.ts';
import { collectionVisibilityMeta } from '../../collection/collectionVisibility.ts';

export function OrganizationRow({
  onOpenOrganization,
  organization,
}: {
  onOpenOrganization?: (slug: string) => void;
  organization: DashboardOrganization;
}) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <PreviewIcon
          color={organization.color}
          iconUrl={organization.iconUrl}
          label={organization.name}
        />
        <a
          href={organizationPath(organization.slug)}
          onClick={(event) => {
            if (!onOpenOrganization) return;
            event.preventDefault();
            onOpenOrganization(organization.slug);
          }}
          className="font-display text-lg font-extrabold text-ink transition-colors hover:text-accent"
        >
          {organization.name}
        </a>
      </div>
      {organization.description && (
        <p className="mt-2 text-sm leading-6 text-muted">
          {organization.description}
        </p>
      )}
      <p className="mt-3 text-sm font-semibold text-muted">
        {organization.projectCount.toLocaleString('en-US')} projects ·{' '}
        {organization.memberCount.toLocaleString('en-US')} members · updated{' '}
        {timeAgo(organization.updatedAt)}
      </p>
    </article>
  );
}

export function CollectionRow({
  collection,
  onOpenCollection,
  onOpenProjectReference,
  ownerUsername,
}: {
  collection: DashboardCollection;
  onOpenCollection?: (collection: {
    ownerUsername: string;
    slug: string;
  }) => void;
  onOpenProjectReference?: (project: SelectedProject) => void;
  ownerUsername?: string;
}) {
  const visibility = collectionVisibilityMeta(collection.visibility);
  const linkedOwnerUsername =
    collection.visibility === 'PUBLIC' || collection.visibility === 'UNLISTED'
      ? ownerUsername
      : undefined;

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <PreviewIcon
          color={collection.color}
          iconUrl={collection.iconUrl}
          label={collection.name}
        />
        {linkedOwnerUsername !== undefined ? (
          <a
            href={collectionPath({
              ownerUsername: linkedOwnerUsername,
              slug: collection.slug,
            })}
            onClick={(event) => {
              if (!onOpenCollection) return;
              event.preventDefault();
              onOpenCollection({
                ownerUsername: linkedOwnerUsername,
                slug: collection.slug,
              });
            }}
            className="font-display text-lg font-extrabold text-ink transition-colors hover:text-accent"
          >
            {collection.name}
          </a>
        ) : (
          <h3 className="font-display text-lg font-extrabold text-ink">
            {collection.name}
          </h3>
        )}
      </div>
      {collection.description && (
        <p className="mt-2 text-sm leading-6 text-muted">
          {collection.description}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-muted">
        <span>{collection.projectCount.toLocaleString('en-US')} projects</span>
        <span aria-hidden="true">·</span>
        <span>updated {timeAgo(collection.updatedAt)}</span>
        <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-control px-2 text-[11px] font-bold text-muted">
          <visibility.Icon className="size-3 text-accent-icon" />
          {visibility.label}
        </span>
      </div>
      {collection.items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {collection.items.map((item) => (
            <a
              key={`${collection.id}-${item.project.slug}`}
              href={projectPath(
                projectTypeFromKind(item.project.kind),
                item.project.slug,
              )}
              onClick={(event) => {
                if (!onOpenProjectReference) return;
                event.preventDefault();
                onOpenProjectReference({
                  projectType: projectTypeFromKind(item.project.kind),
                  slug: item.project.slug,
                });
              }}
              className="inline-flex max-w-full items-center gap-2 rounded-md border border-line bg-control px-2 py-1 text-xs font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover"
            >
              <span className="text-faint">{item.sortOrder + 1}</span>
              <span className="truncate">{item.project.title}</span>
            </a>
          ))}
        </div>
      )}
    </article>
  );
}

function PreviewIcon({
  color,
  iconUrl,
  label,
}: {
  color: string | null;
  iconUrl: string | null;
  label: string;
}) {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt=""
        className="size-7 rounded-md border border-line bg-surface-2 object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="grid size-7 shrink-0 place-items-center rounded-md text-xs font-extrabold text-white"
      style={{ backgroundColor: color ?? '#1d9bf0' }}
    >
      {label.slice(0, 1).toUpperCase()}
    </span>
  );
}
