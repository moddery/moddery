import { Building2, Package, UsersRound } from 'lucide-react';
import { type ReactNode } from 'react';

import { userPath } from '../../app/routing.ts';
import { formatDate, timeAgo } from '../../lib/format.ts';
import { type OrganizationProfile } from '../../lib/organizations.ts';
import { CopyLinkButton } from '../CopyLinkButton.tsx';

export function OrganizationHeader({
  organization,
}: {
  organization: OrganizationProfile;
}) {
  const ownerName =
    organization.owner.displayName ?? organization.owner.username;

  return (
    <header className="border-b border-line pb-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface-2 text-muted sm:size-24">
          {organization.iconUrl ? (
            <img
              src={organization.iconUrl}
              alt={`${organization.name} icon`}
              className="size-full object-cover"
            />
          ) : organization.color ? (
            <span
              aria-hidden="true"
              className="size-8 rounded-full"
              style={{ backgroundColor: organization.color }}
            />
          ) : (
            <Building2 className="size-8" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-3xl font-extrabold text-ink">
            {organization.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-muted">
            <span>@{organization.slug}</span>
            <span aria-hidden="true">·</span>
            <span>
              owned by{' '}
              <a
                href={userPath(organization.owner.username)}
                className="text-ink transition-colors hover:text-accent"
              >
                {ownerName}
              </a>
            </span>
            <span aria-hidden="true">·</span>
            <span>created {formatDate(organization.createdAt)}</span>
            <span aria-hidden="true">·</span>
            <span>updated {timeAgo(organization.updatedAt)}</span>
          </div>
          {organization.description && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink">
              {organization.description}
            </p>
          )}
        </div>

        <CopyLinkButton />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <OrganizationStat
          icon={<Package className="size-4" />}
          label="Projects"
          value={organization.projectCount}
        />
        <OrganizationStat
          icon={<UsersRound className="size-4" />}
          label="Members"
          value={organization.memberCount}
        />
        <OrganizationStat
          icon={<Building2 className="size-4" />}
          label="Created"
          value={new Date(organization.createdAt).getFullYear()}
        />
      </div>
    </header>
  );
}

function OrganizationStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-3">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <div className="mt-1 text-lg font-extrabold text-ink tabular-nums">
        {value.toLocaleString('en-US')}
      </div>
    </div>
  );
}
