import { Search } from 'lucide-react';

export function EmptyState({
  onClear,
  itemLabel = 'mods',
}: {
  onClear: () => void;
  itemLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="text-accent-icon">
        <Search className="size-6" />
      </div>
      <h3 className="mt-4 text-balance font-display text-lg font-bold text-ink">
        No {itemLabel} match your search
      </h3>
      <p className="mt-1 max-w-sm text-pretty text-sm text-muted">
        Try a different search term, or clear your filters to browse everything.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 inline-flex h-10 items-center rounded-lg bg-control px-4 text-sm font-bold text-ink transition-colors hover:bg-control-hover"
      >
        Clear all filters
      </button>
    </div>
  );
}
