import {
  type DashboardCollection,
  type DashboardOrganization,
} from '../../../lib/dashboard.ts';
import { timeAgo } from '../../../lib/format.ts';

export function OrganizationRow({
  organization,
}: {
  organization: DashboardOrganization;
}) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-3 rounded-full"
          style={{ backgroundColor: organization.color ?? '#1d9bf0' }}
        />
        <a
          href={`/organizations/${organization.slug}`}
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
}: {
  collection: DashboardCollection;
}) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-3 rounded-full"
          style={{ backgroundColor: collection.color ?? '#1d9bf0' }}
        />
        <h3 className="font-display text-lg font-extrabold text-ink">
          {collection.name}
        </h3>
      </div>
      {collection.description && (
        <p className="mt-2 text-sm leading-6 text-muted">
          {collection.description}
        </p>
      )}
      <p className="mt-3 text-sm font-semibold text-muted">
        {collection.projectCount.toLocaleString('en-US')} projects · updated{' '}
        {timeAgo(collection.updatedAt)}
      </p>
    </article>
  );
}
