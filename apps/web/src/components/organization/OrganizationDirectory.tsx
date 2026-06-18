import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';

import { fetchPublicOrganizations } from '../../lib/organizations.ts';
import { type Mod } from '../../types.ts';
import { EmptyState } from '../EmptyState.tsx';
import { type SearchTag } from '../ModCard.tsx';
import { Pagination } from '../Pagination.tsx';
import { OrganizationProjectGrid } from './OrganizationProjectList.tsx';
import { OrganizationDirectorySkeleton } from './OrganizationSkeletons.tsx';

const pageSize = 20;

export function OrganizationDirectory({
  onOpenProject,
  onTagSearch,
}: {
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim();

  useEffect(() => {
    setPage(1);
  }, [normalizedQuery]);

  const organizationsQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchPublicOrganizations(normalizedQuery, page, pageSize, signal),
    queryKey: ['organizations', 'public', normalizedQuery, page],
  });

  const organizations = organizationsQuery.data?.organizations ?? [];
  const totalHits = organizationsQuery.data?.totalHits ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));
  const hasSearch = query.trim() !== '';

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <header className="border-b border-line pb-5 sm:flex sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Organizations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Browse creator groups and their published projects.
          </p>
        </div>
        <label className="mt-4 block w-full max-w-sm sm:mt-0">
          <span className="sr-only">Search organizations</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder="Search organizations..."
              className="h-10 w-full rounded-lg border border-line bg-control pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent"
            />
          </span>
        </label>
      </header>

      {organizationsQuery.isLoading ? (
        <OrganizationDirectorySkeleton />
      ) : organizations.length === 0 && !hasSearch ? (
        <EmptyState onClear={() => window.history.back()} itemLabel="groups" />
      ) : organizations.length === 0 ? (
        <EmptyState
          onClear={() => {
            setQuery('');
          }}
          itemLabel="organizations matching this search"
        />
      ) : (
        <div className="mt-6 grid gap-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-muted">
              Showing {organizations.length.toLocaleString('en-US')} of{' '}
              {totalHits.toLocaleString('en-US')} organizations
            </p>
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            )}
          </div>
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
                projects={organization.projects}
                onOpenProject={onOpenProject}
                onTagSearch={onTagSearch}
              />
            </section>
          ))}
          {totalPages > 1 && (
            <div className="flex justify-end">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
