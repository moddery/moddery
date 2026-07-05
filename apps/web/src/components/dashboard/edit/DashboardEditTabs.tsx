import { motion } from 'motion/react';

import { cn } from '../../../lib/cn.ts';

export interface DashboardEditTabItem {
  id: string;
  label: string;
}

export function DashboardEditTabs({
  activeId,
  onSelect,
  tabs,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  tabs: DashboardEditTabItem[];
}) {
  if (tabs.length < 2) return null;

  return (
    <div
      role="tablist"
      aria-label="Edit sections"
      className="flex gap-6 overflow-x-auto border-b border-line scrollbar-none"
    >
      {tabs.map((tab) => {
        const selected = activeId === tab.id;

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
            {selected && (
              <motion.span
                layoutId="dashboardEditTabUnderline"
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
