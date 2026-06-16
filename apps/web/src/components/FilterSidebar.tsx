import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '../lib/cn.ts';
import { LoaderGlyph, categoryIcon } from './icons.tsx';
import { loaderLabel, categoryLabel } from './Chips.tsx';

export interface FacetOption {
  value: string;
}

export type TagFacetOption =
  | { kind: 'category'; value: string }
  | { kind: 'loader'; value: string }
  | { kind: 'version'; value: string };

interface FilterSidebarProps {
  tagOptions: TagFacetOption[];
  versionOptions: FacetOption[];
  loaderOptions: FacetOption[];
  categoryOptions: FacetOption[];
  selectedTags: Set<string>;
  selectedVersions: Set<string>;
  selectedLoaders: Set<string>;
  selectedCategories: Set<string>;
  onToggleTag: (tag: TagFacetOption) => void;
  onToggleVersion: (value: string) => void;
  onToggleLoader: (value: string) => void;
  onToggleCategory: (value: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

function Panel({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="pb-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 border-b border-line/70 px-1 pb-2 pt-1 text-left transition-colors hover:text-accent-icon"
      >
        <span className="font-display text-xs font-bold uppercase text-ink">
          {title}
        </span>
        <ChevronDown
          className={cn(
            'size-4 text-accent-icon transition-transform duration-200',
            !open && '-rotate-90',
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function CheckRow({
  checked,
  onToggle,
  label,
  icon,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onToggle}
      className={cn(
        'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted transition-colors hover:bg-control-hover hover:text-ink',
        checked && 'bg-accent-selected text-ink hover:bg-accent-selected',
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {icon}
        <span className="truncate">{label}</span>
      </span>
    </button>
  );
}

function tagKey(tag: TagFacetOption): string {
  return `${tag.kind}:${tag.value}`;
}

function tagLabel(tag: TagFacetOption): string {
  if (tag.kind === 'category') return categoryLabel(tag.value);
  if (tag.kind === 'loader') return loaderLabel(tag.value);
  return tag.value;
}

function tagIcon(tag: TagFacetOption): ReactNode {
  if (tag.kind === 'category') {
    const Icon = categoryIcon(tag.value);
    return <Icon className="size-4 text-accent-icon" />;
  }

  if (tag.kind === 'loader') {
    return <LoaderGlyph className="size-4 text-accent-icon" />;
  }

  return undefined;
}

function TagsPanel({
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

function GameVersionPanel({
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

export function FilterSidebar({
  tagOptions,
  versionOptions,
  loaderOptions,
  categoryOptions,
  selectedTags,
  selectedVersions,
  selectedLoaders,
  selectedCategories,
  onToggleTag,
  onToggleVersion,
  onToggleLoader,
  onToggleCategory,
  onClearAll,
  hasActiveFilters,
  className,
}: FilterSidebarProps) {
  return (
    <div
      className={cn(
        'scrollbar-none flex flex-col gap-4 lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:pr-1',
        className,
      )}
    >
      <div className="flex items-center justify-between px-1 pb-1">
        <h2 className="font-display text-base font-extrabold text-ink">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-bold text-ink transition-colors hover:text-accent-icon"
          >
            Clear all
          </button>
        )}
      </div>

      <TagsPanel
        options={tagOptions}
        selected={selectedTags}
        onToggle={onToggleTag}
      />

      <GameVersionPanel
        options={versionOptions}
        selected={selectedVersions}
        onToggle={onToggleVersion}
      />

      {loaderOptions.length > 0 && (
        <Panel title="Loader">
          <div>
            {loaderOptions.map((o) => (
              <CheckRow
                key={o.value}
                checked={selectedLoaders.has(o.value)}
                onToggle={() => onToggleLoader(o.value)}
                label={loaderLabel(o.value)}
                icon={<LoaderGlyph className="size-4 text-accent-icon" />}
              />
            ))}
          </div>
        </Panel>
      )}

      {categoryOptions.length > 0 && (
        <Panel title="Category">
          <div>
            {categoryOptions.map((o) => {
              const Icon = categoryIcon(o.value);
              return (
                <CheckRow
                  key={o.value}
                  checked={selectedCategories.has(o.value)}
                  onToggle={() => onToggleCategory(o.value)}
                  label={categoryLabel(o.value)}
                  icon={<Icon className="size-4 text-accent-icon" />}
                />
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}
