import { useQuery } from '@tanstack/react-query';
import { Building2, Package, UsersRound } from 'lucide-react';
import { type ReactNode } from 'react';

import { timeAgo } from '../lib/format.ts';
import {
  fetchPublicOrganizations,
  fetchOrganizationProfile,
  organizationProjectToMod,
  type OrganizationProfile,
} from '../lib/organizations.ts';
import { type Mod } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';
import { ModCard } from './ModCard.tsx';

export function OrganizationPage({
  slug,
  onOpenProject,
}: {
  slug: string | null;
  onOpenProject: (mod: Mod) => void;
}) {
  if (slug === null) {
    return <OrganizationDirectory onOpenProject={onOpenProject} />;
  }

  return <OrganizationDetail slug={slug} onOpenProject={onOpenProject} />;
}

function OrganizationDetail({
  slug,
  onOpenProject,
}: {
  slug: string;
  onOpenProject: (mod: Mod) => void;
}) {
  const organizationQuery = useQuery({
    queryFn: ({ signal }) => fetchOrganizationProfile(slug, signal),
    queryKey: ['organizations', slug],
  });

  if (organizationQuery.isLoading) {
    return <OrganizationSkeleton />;
  }

  if (!organizationQuery.data) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
        <EmptyState
          onClear={() => window.history.back()}
          itemLabel="organizations"
        />
      </main>
    );
  }

  const organization = organizationQuery.data;

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <OrganizationHeader organization={organization} />

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <h2 className="font-display text-xl font-extrabold text-ink">
            Projects
          </h2>
          <span className="text-sm font-semibold text-muted">
            {organization.projectCount.toLocaleString('en-US')} total
          </span>
        </div>

        {organization.projects.length === 0 ? (
          <p className="py-8 text-sm text-muted">No public projects yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {organization.projects.map((project) => {
              const mod = organizationProjectToMod(project);
              return (
                <ModCard
                  key={project.slug}
                  mod={mod}
                  layout="list"
                  onOpen={onOpenProject}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function OrganizationDirectory({
  onOpenProject,
}: {
  onOpenProject: (mod: Mod) => void;
}) {
  const organizationsQuery = useQuery({
    queryFn: ({ signal }) => fetchPublicOrganizations(signal),
    queryKey: ['organizations', 'public'],
  });

  const organizations = organizationsQuery.data ?? [];

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <header className="border-b border-line pb-5">
        <h1 className="font-display text-3xl font-extrabold text-ink">
          Organizations
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Browse creator groups and their published projects.
        </p>
      </header>

      {organizationsQuery.isLoading ? (
        <OrganizationDirectorySkeleton />
      ) : organizations.length === 0 ? (
        <EmptyState onClear={() => window.history.back()} itemLabel="groups" />
      ) : (
        <div className="mt-6 grid gap-8">
          {organizations.map((organization) => (
            <section
              key={organization.id}
              className="border-b border-line pb-7"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-3 rounded-full"
                      style={{
                        backgroundColor: organization.color ?? '#1d9bf0',
                      }}
                    />
                    <a
                      href={`/organizations/${organization.slug}`}
                      className="truncate font-display text-xl font-extrabold text-ink transition-colors hover:text-accent"
                    >
                      {organization.name}
                    </a>
                  </div>
                  {organization.description && (
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                      {organization.description}
                    </p>
                  )}
                </div>
                <p className="text-sm font-semibold text-muted">
                  {organization.projectCount.toLocaleString('en-US')} projects ·{' '}
                  {organization.memberCount.toLocaleString('en-US')} members
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                {organization.projects.map((project) => {
                  const mod = organizationProjectToMod(project);
                  return (
                    <ModCard
                      key={project.slug}
                      mod={mod}
                      layout="list"
                      onOpen={onOpenProject}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function OrganizationHeader({
  organization,
}: {
  organization: OrganizationProfile;
}) {
  const ownerName =
    organization.owner.displayName ?? organization.owner.username;

  return (
    <header className="border-b border-line pb-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface-2 text-muted">
          {organization.iconUrl ? (
            <img
              src={organization.iconUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <Building2 className="size-8" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-3xl font-extrabold text-ink">
            {organization.name}
          </h1>
          <p className="mt-1 text-sm font-semibold text-muted">
            @{organization.slug} · owned by{' '}
            <a
              href={`/users/${organization.owner.username}`}
              className="text-ink transition-colors hover:text-accent"
            >
              {ownerName}
            </a>{' '}
            · updated {timeAgo(organization.updatedAt)}
          </p>
          {organization.description && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink">
              {organization.description}
            </p>
          )}
        </div>
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

function OrganizationSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <div className="border-b border-line pb-6">
        <div className="flex gap-5">
          <div className="size-20 animate-pulse rounded-xl bg-surface-2" />
          <div className="flex-1">
            <div className="h-8 w-56 animate-pulse rounded bg-surface-2" />
            <div className="mt-3 h-4 w-64 animate-pulse rounded bg-surface-2" />
            <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="h-28 animate-pulse rounded bg-surface-2" />
        <div className="h-28 animate-pulse rounded bg-surface-2" />
      </div>
    </main>
  );
}

function OrganizationDirectorySkeleton() {
  return (
    <div className="mt-6 grid gap-8">
      {[0, 1].map((item) => (
        <section key={item} className="border-b border-line pb-7">
          <div className="h-6 w-48 animate-pulse rounded bg-surface-2" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-surface-2" />
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="h-28 animate-pulse rounded bg-surface-2" />
            <div className="h-28 animate-pulse rounded bg-surface-2" />
          </div>
        </section>
      ))}
    </div>
  );
}
