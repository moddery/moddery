import { Search } from 'lucide-react';
import { useState } from 'react';

import { CheckRow } from './CheckRow.tsx';
import { Panel } from './Panel.tsx';
import { type FacetOption } from './types.ts';

export function GameVersionPanel({
  options,
  selected,
  onToggle,
}: {
  options: FacetOption[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim();
  const filtered = q ? options.filter((o) => o.value.includes(q)) : options;

  return (
    <Panel title="Game version">
      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-accent-icon" />
        <input
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search versions..."
          aria-label="Search game versions"
          className="h-9 w-full rounded-md border border-line bg-control pl-8 pr-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent"
        />
      </div>

      <div className="scrollbar-none max-h-72 overflow-y-auto">
        {filtered.map((o) => (
          <CheckRow
            key={o.value}
            checked={selected.has(o.value)}
            onToggle={() => onToggle(o.value)}
            label={o.value}
          />
        ))}
        {filtered.length === 0 && (
          <p className="px-2 py-3 text-xs text-faint">No versions found.</p>
        )}
      </div>
    </Panel>
  );
}
