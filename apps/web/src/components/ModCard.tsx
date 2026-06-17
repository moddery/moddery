import type { Mod } from '../types.ts';
import {
  Downloads,
  Follows,
  ProjectIcon,
  projectHref,
  Tags,
  Updated,
} from './mod-card/ModCardParts.tsx';

export type Layout = 'list' | 'grid';
export type SearchTag =
  | { kind: 'category'; value: string }
  | { kind: 'loader'; value: string };

const listRow =
  'group relative block border-b border-line px-3 py-4 text-ink no-underline transition-colors hover:bg-surface';

const gridCard =
  'group flex min-h-full w-full flex-col rounded-xl border border-line bg-surface p-4 text-ink no-underline transition-colors hover:border-line-strong hover:bg-surface-2';

export function ModCard({
  mod,
  layout,
  onOpen,
  onTagSearch,
}: {
  mod: Mod;
  layout: Layout;
  onOpen?: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!onOpen) return;
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    onOpen(mod);
  }

  if (layout === 'grid') {
    return (
      <a
        href={projectHref(mod)}
        onClick={handleClick}
        aria-label={`Open ${mod.title}`}
        className={gridCard}
      >
        <div className="flex items-center gap-3">
          <ProjectIcon mod={mod} className="size-[52px]" size={52} />
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-extrabold text-ink">
              {mod.title}
            </h3>
            <p className="truncate text-xs font-medium text-muted">
              by {mod.author}
            </p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 flex-1 text-pretty text-sm text-muted">
          {mod.description}
        </p>

        <div className="mt-3">
          <Tags mod={mod} onTagSearch={onTagSearch} />
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm">
          <Downloads mod={mod} />
          <Follows mod={mod} />
          <span className="ml-auto">
            <Updated mod={mod} />
          </span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={projectHref(mod)}
      onClick={handleClick}
      aria-label={`Open ${mod.title}`}
      className={listRow}
    >
      <div className="flex gap-4">
        <ProjectIcon mod={mod} className="size-16 sm:size-20" size={80} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-balance font-display text-lg font-extrabold text-ink sm:text-xl">
                {mod.title}
                <span className="ml-1.5 font-sans text-sm font-medium text-muted">
                  by {mod.author}
                </span>
              </h3>
              <p className="mt-1 line-clamp-2 text-pretty text-sm text-muted">
                {mod.description}
              </p>
            </div>

            <div className="hidden shrink-0 flex-col items-end gap-1.5 text-right sm:flex">
              <div className="flex items-center gap-3 text-sm">
                <Downloads mod={mod} />
                <Follows mod={mod} />
              </div>
              <Updated mod={mod} withLabel />
            </div>
          </div>

          <div className="mt-3">
            <Tags mod={mod} onTagSearch={onTagSearch} />
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm sm:hidden">
            <Downloads mod={mod} />
            <Follows mod={mod} />
            <span className="ml-auto">
              <Updated mod={mod} />
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
