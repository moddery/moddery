import { useQuery } from '@tanstack/react-query';

import { fetchPublicOrganizations } from '../../lib/organizations.ts';
import { type Mod } from '../../types.ts';
import { EmptyState } from '../EmptyState.tsx';
import { OrganizationProjectGrid } from './OrganizationProjectList.tsx';
import { OrganizationDirectorySkeleton } from './OrganizationSkeletons.tsx';

export function OrganizationDirectory({
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

              <OrganizationProjectGrid
                organization={organization}
                onOpenProject={onOpenProject}
              />
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
