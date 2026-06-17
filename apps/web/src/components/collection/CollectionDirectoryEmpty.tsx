import { BookMarked } from 'lucide-react';

export function CollectionDirectoryEmpty({
  onClear,
  searchActive,
}: {
  onClear: () => void;
  searchActive: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="text-accent-icon">
        <BookMarked className="size-6" />
      </div>
      <h2 className="mt-4 font-display text-lg font-bold text-ink">
        {searchActive
          ? 'No collections match this search'
          : 'No public collections yet'}
      </h2>
      {searchActive ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 inline-flex h-9 items-center rounded-lg border border-line px-3 text-sm font-bold text-ink transition-colors hover:bg-control-hover"
        >
          Clear search
        </button>
      ) : (
        <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
          Public lists will show up here once creators publish them.
        </p>
      )}
    </div>
  );
}
