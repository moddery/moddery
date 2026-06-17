import { motion } from 'motion/react';

import { cn } from '../../../lib/cn.ts';
import { projectTabs, type ProjectTab } from './constants.ts';

export function ProjectTabs({
  activeTab,
  galleryCount,
  changelogCount,
  versionCount,
  onSelect,
}: {
  activeTab: ProjectTab;
  galleryCount: number;
  changelogCount: number;
  versionCount: number;
  onSelect: (tab: ProjectTab) => void;
}) {
  const counts: Partial<Record<ProjectTab, number>> = {
    gallery: galleryCount,
    changelog: changelogCount,
    versions: versionCount,
  };

  return (
    <div
      role="tablist"
      aria-label="Project sections"
      className="flex gap-6 overflow-x-auto border-b border-line scrollbar-none"
    >
      {projectTabs.map((tab) => {
        const selected = activeTab === tab.id;
        const count = counts[tab.id];

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(tab.id)}
            className={cn(
              'relative flex h-11 items-center gap-2 whitespace-nowrap px-0.5 text-sm font-extrabold transition-colors',
              selected ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {tab.label}
            {typeof count === 'number' && count > 0 && (
              <span
                className={cn(
                  'text-xs font-extrabold tabular-nums',
                  selected ? 'text-accent-icon' : 'text-muted',
                )}
              >
                {count.toLocaleString('en-US')}
              </span>
            )}
            {selected && (
              <motion.span
                layoutId="projectTabUnderline"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent"
                transition={{ type: 'spring', stiffness: 480, damping: 38 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
