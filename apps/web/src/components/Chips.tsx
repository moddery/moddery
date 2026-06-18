import type { ReactNode } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { cn } from '../lib/cn.ts';
import type { Environment } from '../types.ts';
import { Globe, Monitor, Server, type LucideIcon } from 'lucide-react';
import { LoaderGlyph, categoryIcon } from './icons.tsx';

export function Chip({
  children,
  icon,
  className,
  onClick,
}: {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  function handleClick(event: MouseEvent<HTMLSpanElement>) {
    if (onClick === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    onClick();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (onClick === undefined) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    onClick();
  }

  return (
    <span
      role={onClick === undefined ? undefined : 'button'}
      tabIndex={onClick === undefined ? undefined : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2 py-1 text-xs font-semibold text-muted',
        'transition-colors hover:bg-control-hover group-hover:bg-control-hover',
        onClick !== undefined && 'cursor-pointer text-left',
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

const ENV_META: Record<Environment, { label: string; Icon: LucideIcon }> = {
  both: { label: 'Client or server', Icon: Globe },
  client: { label: 'Client', Icon: Monitor },
  server: { label: 'Server', Icon: Server },
};

export function EnvTag({ env }: { env: Environment }) {
  const { label, Icon } = ENV_META[env];
  return (
    <Chip icon={<Icon className="size-3.5 text-accent-icon" />}>{label}</Chip>
  );
}

const LOADER_LABELS: Record<string, string> = {
  babric: 'Babric',
  bukkit: 'Bukkit',
  bungeecord: 'BungeeCord',
  canvas: 'Canvas',
  datapack: 'Data Pack',
  fabric: 'Fabric',
  folia: 'Folia',
  forge: 'Forge',
  geyser: 'Geyser',
  iris: 'Iris',
  minecraft: 'Minecraft',
  neoforge: 'NeoForge',
  optifine: 'OptiFine',
  paper: 'Paper',
  purpur: 'Purpur',
  quilt: 'Quilt',
  spigot: 'Spigot',
  sponge: 'Sponge',
  vanilla: 'Vanilla',
  velocity: 'Velocity',
  waterfall: 'Waterfall',
};

export function loaderLabel(loader: string): string {
  return (
    LOADER_LABELS[loader] ?? loader.charAt(0).toUpperCase() + loader.slice(1)
  );
}

export function LoaderTag({
  loader,
  onClick,
}: {
  loader: string;
  onClick?: () => void;
}) {
  return (
    <Chip
      icon={<LoaderGlyph className="size-3.5 text-accent-icon" />}
      onClick={onClick}
    >
      {loaderLabel(loader)}
    </Chip>
  );
}

export function categoryLabel(category: string): string {
  return category
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function CategoryTag({
  category,
  onClick,
}: {
  category: string;
  onClick?: () => void;
}) {
  const Icon = categoryIcon(category);
  return (
    <Chip
      icon={<Icon className="size-3.5 text-accent-icon" />}
      onClick={onClick}
    >
      {categoryLabel(category)}
    </Chip>
  );
}

export function VersionTag({
  version,
  onClick,
}: {
  version: string;
  onClick?: () => void;
}) {
  return <Chip onClick={onClick}>{version}</Chip>;
}
