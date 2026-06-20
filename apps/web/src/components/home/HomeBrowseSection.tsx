import { Compass, PackageSearch, Server } from 'lucide-react';

import { projectTypeMeta } from '../../lib/projectTypes.ts';
import { type SearchTag } from '../ModCard.tsx';
import { HOME_BROWSE_GROUPS, type HomeBrowseGroup } from './browseShortcuts.ts';

const groupIcons = [Compass, Server, PackageSearch] as const;

export function HomeBrowseSection({
  onTagSearch,
}: {
  onTagSearch: (tag: SearchTag) => void;
}) {
  return (
    <section className="border-b border-line pb-8">
      <div className="flex flex-col gap-1 pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Browse faster
        </h2>
        <p className="text-sm leading-6 text-muted">
          Jump straight into filtered discovery by content type, loader, and use
          case.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {HOME_BROWSE_GROUPS.map((group, index) => (
          <HomeBrowseGroupCard
            key={group.label}
            group={group}
            iconIndex={index}
            onTagSearch={onTagSearch}
          />
        ))}
      </div>
    </section>
  );
}

function HomeBrowseGroupCard({
  group,
  iconIndex,
  onTagSearch,
}: {
  group: HomeBrowseGroup;
  iconIndex: number;
  onTagSearch: (tag: SearchTag) => void;
}) {
  const Icon = groupIcons[iconIndex % groupIcons.length] ?? Compass;
  const meta = projectTypeMeta(group.projectType);

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-accent-icon">
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-extrabold text-ink">
            {group.label}
          </h3>
          <p className="text-xs font-semibold text-muted">{meta.label}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {group.shortcuts.map((shortcut) => (
          <button
            key={`${shortcut.tag.kind}-${shortcut.tag.value}`}
            type="button"
            onClick={() => onTagSearch(shortcut.tag)}
            className="rounded-lg border border-line bg-control p-3 text-left transition-colors hover:border-line-strong hover:bg-control-hover"
          >
            <span className="block text-sm font-bold text-ink">
              {shortcut.label}
            </span>
            <span className="mt-1 block text-xs leading-5 text-muted">
              {shortcut.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
