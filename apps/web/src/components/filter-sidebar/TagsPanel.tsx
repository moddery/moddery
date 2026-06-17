import { Search } from 'lucide-react';
import { useState } from 'react';

import { CheckRow } from './CheckRow.tsx';
import { Panel } from './Panel.tsx';
import { tagIcon, tagKey, tagLabel } from './tagHelpers.tsx';
import { type TagFacetOption } from './types.ts';

export function TagsPanel({
  options,
  selected,
  onToggle,
}: {
  options: TagFacetOption[];
  selected: Set<string>;
  onToggle: (tag: TagFacetOption) => void;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((option) => tagLabel(option).toLowerCase().includes(q))
    : options;

  if (options.length === 0) return null;

  return (
    <Panel title="Tags">
      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-accent-icon" />
        <input
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tags..."
          aria-label="Search tags"
          className="h-9 w-full rounded-md border border-line bg-control pl-8 pr-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent"
        />
      </div>

      <div className="scrollbar-none max-h-72 overflow-y-auto">
        {filtered.map((tag) => (
          <CheckRow
            key={tagKey(tag)}
            checked={selected.has(tagKey(tag))}
            onToggle={() => onToggle(tag)}
            description={tag.description}
            label={tagLabel(tag)}
            icon={tagIcon(tag)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="px-2 py-3 text-xs text-faint">No tags found.</p>
        )}
      </div>
    </Panel>
  );
}
