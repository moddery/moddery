import { Search, X } from 'lucide-react';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search mods...',
  ariaLabel = 'Search mods',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  return (
    <div role="search" className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4.5 -translate-y-1/2 text-accent-icon" />
      <input
        type="text"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-10 w-full rounded-lg border border-line bg-control pl-10 pr-11 text-sm text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-accent-icon transition-colors hover:bg-control-hover"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
