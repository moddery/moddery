import { Search, ScrollText } from 'lucide-react';
import { useState } from 'react';

import { CheckRow } from './CheckRow.tsx';
import { Panel } from './Panel.tsx';
import { type FacetOption } from './types.ts';

export function LicensePanel({
  options,
  selected,
  onToggle,
}: {
  options: FacetOption[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((option) =>
        `${option.label ?? option.value} ${option.value}`
          .toLowerCase()
          .includes(q),
      )
    : options;

  if (options.length === 0) return null;

  return (
    <Panel title="License" defaultOpen={false}>
      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-accent-icon" />
        <input
          type="text"
          inputMode="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search licenses..."
          aria-label="Search licenses"
          className="h-9 w-full rounded-md border border-line bg-control pl-8 pr-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent"
        />
      </div>

      <div className="scrollbar-none max-h-72 overflow-y-auto">
        {filtered.map((option) => (
          <CheckRow
            key={option.value}
            checked={selected.has(option.value)}
            onToggle={() => onToggle(option.value)}
            description={option.value}
            label={option.label ?? option.value}
            icon={<ScrollText className="size-4 text-accent-icon" />}
          />
        ))}
        {filtered.length === 0 && (
          <p className="px-2 py-3 text-xs text-faint">No licenses found.</p>
        )}
      </div>
    </Panel>
  );
}
