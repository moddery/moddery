import { cn } from '../lib/cn.ts';
import { CONTENT_TYPES } from '../lib/projectTypes.ts';
import { motion } from 'motion/react';
import { type ReactNode } from 'react';
import type { ProjectType } from '../types.ts';
import { Plus } from 'lucide-react';
import { ModderyMark } from './icons.tsx';

export function NavBar({
  activeType,
  onTypeChange,
  onHome,
  onDiscover,
  isDiscoverActive,
  showContentTabs,
  accountSlot,
}: {
  activeType: ProjectType;
  onTypeChange: (type: ProjectType) => void;
  onHome: () => void;
  onDiscover: () => void;
  isDiscoverActive: boolean;
  showContentTabs: boolean;
  accountSlot?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center gap-4 px-4 sm:px-6">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onHome();
          }}
          className="flex shrink-0 items-center gap-2.5"
        >
          <ModderyMark className="size-8 text-accent-icon" />
          <span className="font-display text-xl font-extrabold lowercase text-ink">
            moddery
          </span>
        </a>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          <a
            href="/mods"
            onClick={(e) => {
              e.preventDefault();
              onDiscover();
            }}
            className={cn(
              'border-b px-2.5 py-1.5 text-sm font-semibold transition-colors hover:border-accent-icon hover:text-ink',
              isDiscoverActive
                ? 'border-accent-icon text-ink'
                : 'border-transparent text-muted',
            )}
          >
            Discover
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Publish"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Publish</span>
          </button>
          {accountSlot}
        </div>
      </div>

      {showContentTabs && (
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6">
          <nav
            aria-label="Content types"
            className="flex gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {CONTENT_TYPES.map((tab) => {
              const active = tab.type === activeType;
              return (
                <button
                  key={tab.type}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onTypeChange(tab.type)}
                  className={cn(
                    'relative whitespace-nowrap px-0 pb-3 pt-2 text-sm font-bold transition-colors',
                    active ? 'text-ink' : 'text-muted hover:text-ink',
                  )}
                >
                  {tab.label}
                  {active && (
                    <motion.span
                      layoutId="contentTabUnderline"
                      className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent-icon"
                      transition={{
                        type: 'spring',
                        stiffness: 480,
                        damping: 38,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
