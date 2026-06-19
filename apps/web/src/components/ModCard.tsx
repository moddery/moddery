import type { Mod, ProjectType } from '../types.ts';
import {
  AuthorLink,
  Downloads,
  Follows,
  ProjectIcon,
  projectHref,
  Tags,
  Updated,
} from './mod-card/ModCardParts.tsx';

export type Layout = 'list' | 'grid';
export type SearchTag =
  | { kind: 'category'; projectType?: ProjectType; value: string }
  | { kind: 'license'; projectType?: ProjectType; value: string }
  | { kind: 'loader'; projectType?: ProjectType; value: string }
  | { kind: 'version'; projectType?: ProjectType; value: string };

const listRow =
  'group relative border-b border-line px-3 py-4 text-ink transition-colors hover:bg-surface';

const gridCard =
  'group relative flex min-h-full w-full flex-col rounded-xl border border-line bg-surface p-4 text-ink transition-colors hover:border-line-strong hover:bg-surface-2';

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
      <article className={gridCard}>
        <CardLink mod={mod} onClick={handleClick} />

        <div className="pointer-events-none relative z-10 flex items-center gap-3">
          <ProjectIcon mod={mod} className="size-[52px]" size={52} />
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-extrabold text-ink">
              {mod.title}
            </h3>
            <AuthorLink mod={mod} />
          </div>
        </div>

        <p className="pointer-events-none relative z-10 mt-3 line-clamp-2 flex-1 text-pretty text-sm text-muted">
          {mod.description}
        </p>

        <div className="relative z-10 mt-3">
          <Tags mod={mod} onTagSearch={onTagSearch} />
        </div>

        <div className="pointer-events-none relative z-10 mt-3 flex items-center gap-4 text-sm">
          <Downloads mod={mod} />
          <Follows mod={mod} />
          <span className="ml-auto">
            <Updated mod={mod} />
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className={listRow}>
      <CardLink mod={mod} onClick={handleClick} />

      <div className="pointer-events-none relative z-10 flex gap-4">
        <ProjectIcon mod={mod} className="size-16 sm:size-20" size={80} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-balance font-display text-lg font-extrabold text-ink sm:text-xl">
                {mod.title}
              </h3>
              <AuthorLink mod={mod} className="mt-0.5" />
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

          <div className="pointer-events-auto mt-3">
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
    </article>
  );
}

function CardLink({
  mod,
  onClick,
}: {
  mod: Mod;
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      href={projectHref(mod)}
      onClick={onClick}
      aria-label={`Open ${mod.title}`}
      className="absolute inset-0 z-0"
    />
  );
}
