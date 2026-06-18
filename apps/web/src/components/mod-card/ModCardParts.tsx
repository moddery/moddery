import { Clock, Download, Heart } from 'lucide-react';
import type { Mod, ProjectType } from '../../types.ts';
import { organizationPath, userPath } from '../../app/routing.ts';
import { environmentOf } from '../../types.ts';
import { cn } from '../../lib/cn.ts';
import { formatCount, timeAgo } from '../../lib/format.ts';
import { projectTypeMeta } from '../../lib/projectTypes.ts';
import { CategoryTag, EnvTag, LoaderTag } from '../Chips.tsx';
import type { SearchTag } from '../ModCard.tsx';

export function projectHref(mod: Mod) {
  return projectPath(mod.projectType ?? 'mod', mod.slug);
}

export function projectPath(projectType: ProjectType, slug: string) {
  const meta = projectTypeMeta(projectType);
  return `/${meta.path}?project=${encodeURIComponent(slug)}&type=${encodeURIComponent(meta.type)}`;
}

export function AuthorLink({
  mod,
  className,
}: {
  mod: Mod;
  className?: string;
}) {
  const content = `by ${mod.author}`;
  if (mod.organization) {
    return (
      <p className={cn('truncate text-xs font-medium text-muted', className)}>
        by{' '}
        <a
          href={organizationPath(mod.organization.slug)}
          onClick={(event) => event.stopPropagation()}
          className="pointer-events-auto relative z-20 text-muted transition-colors hover:text-accent"
        >
          {mod.organization.name}
        </a>
      </p>
    );
  }

  if (!mod.authorUsername) {
    return (
      <p className={cn('truncate text-xs font-medium text-muted', className)}>
        {content}
      </p>
    );
  }

  return (
    <p className={cn('truncate text-xs font-medium text-muted', className)}>
      by{' '}
      <a
        href={userPath(mod.authorUsername)}
        onClick={(event) => event.stopPropagation()}
        className="pointer-events-auto relative z-20 text-muted transition-colors hover:text-accent"
      >
        {mod.author}
      </a>
    </p>
  );
}

export function ProjectIcon({
  mod,
  className,
  size,
}: {
  mod: Mod;
  className: string;
  size: number;
}) {
  if (!mod.icon) {
    return (
      <div
        aria-hidden="true"
        className={cn(className, 'shrink-0 rounded-md bg-surface-2')}
      />
    );
  }

  return (
    <img
      src={mod.icon}
      alt={`${mod.title} icon`}
      loading="lazy"
      width={size}
      height={size}
      className={cn(className, 'shrink-0 rounded-md bg-surface-2 object-cover')}
    />
  );
}

export function Downloads({ mod }: { mod: Mod }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-bold text-ink tabular-nums">
      <Download className="size-4 text-accent-icon" />
      {formatCount(mod.downloads, 2)}
    </span>
  );
}

export function Follows({ mod }: { mod: Mod }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-muted tabular-nums">
      <Heart className="size-4 text-accent-icon" />
      {formatCount(mod.follows, 1)}
    </span>
  );
}

export function Updated({
  mod,
  withLabel = false,
}: {
  mod: Mod;
  withLabel?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-faint">
      <Clock className="size-3.5 text-accent-icon" />
      {withLabel ? 'Updated ' : ''}
      {timeAgo(mod.updated)}
    </span>
  );
}

export function Tags({
  mod,
  onTagSearch,
}: {
  mod: Mod;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  function tagClick(kind: SearchTag['kind'], value: string) {
    if (onTagSearch === undefined) return undefined;
    return () => onTagSearch({ kind, projectType: mod.projectType, value });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <EnvTag env={environmentOf(mod)} />
      {mod.categories.map((c) => (
        <CategoryTag key={c} category={c} onClick={tagClick('category', c)} />
      ))}
      {mod.loaders.map((l) => (
        <LoaderTag key={l} loader={l} onClick={tagClick('loader', l)} />
      ))}
    </div>
  );
}
