import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';

import { fetchPublicUsers } from '../lib/users.ts';
import { type Mod } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';
import { Pagination } from './Pagination.tsx';
import { UserDirectoryRow } from './users/UserDirectoryRow.tsx';
import { UsersDirectorySkeleton } from './users/UsersDirectorySkeleton.tsx';

const pageSize = 20;

export function UsersPage({
  onOpenProject,
}: {
  onOpenProject: (mod: Mod) => void;
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim();

  useEffect(() => {
    setPage(1);
  }, [normalizedQuery]);

  const usersQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchPublicUsers(normalizedQuery, page, pageSize, signal),
    queryKey: ['users', 'public', normalizedQuery, page],
  });

  const users = usersQuery.data?.users ?? [];
  const totalHits = usersQuery.data?.totalHits ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));
  const hasSearch = query.trim() !== '';

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <header className="border-b border-line pb-5 sm:flex sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Creators
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Browse public creator profiles, recent projects, and collections.
          </p>
        </div>
        <label className="mt-4 block w-full max-w-sm sm:mt-0">
          <span className="sr-only">Search creators</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder="Search creators..."
              className="h-10 w-full rounded-lg border border-line bg-control pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent"
            />
          </span>
        </label>
      </header>

      {usersQuery.isLoading ? (
        <UsersDirectorySkeleton />
      ) : users.length === 0 && !hasSearch ? (
        <EmptyState onClear={() => window.history.back()} itemLabel="users" />
      ) : users.length === 0 ? (
        <EmptyState
          onClear={() => {
            setQuery('');
          }}
          itemLabel="creators matching this search"
        />
      ) : (
        <div className="mt-6 grid gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-muted">
              Showing {users.length.toLocaleString('en-US')} of{' '}
              {totalHits.toLocaleString('en-US')} creators
            </p>
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            )}
          </div>
          {users.map((user) => (
            <UserDirectoryRow
              key={user.id}
              user={user}
              onOpenProject={onOpenProject}
            />
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
