import { Search } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { Pagination } from '../../../Pagination.tsx';

const pageSize = 8;

export function TaxonomyList<T>({
  emptyLabel,
  getKey,
  getSearchText,
  items,
  renderItem,
  searchLabel,
}: {
  emptyLabel: string;
  getKey: (item: T) => string;
  getSearchText: (item: T) => string;
  items: T[];
  renderItem: (item: T) => ReactNode;
  searchLabel: string;
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(
    () =>
      normalizedQuery === ''
        ? items
        : items.filter((item) =>
            getSearchText(item).toLowerCase().includes(normalizedQuery),
          ),
    [getSearchText, items, normalizedQuery],
  );
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const visibleItems = filteredItems.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [normalizedQuery, items]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  if (items.length === 0) {
    return <p className="text-sm font-semibold text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="mt-1 grid gap-2">
      <label className="relative block">
        <span className="sr-only">{searchLabel}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchLabel}
          className="h-9 w-full rounded-md border border-line bg-control pl-8 pr-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent"
        />
      </label>

      <div className="grid gap-2">
        {visibleItems.map((item) => (
          <div key={getKey(item)}>{renderItem(item)}</div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p className="text-sm font-semibold text-muted">
          No rows match this search.
        </p>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      )}
    </div>
  );
}
