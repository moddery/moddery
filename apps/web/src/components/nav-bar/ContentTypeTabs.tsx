import { motion } from 'motion/react';

import { cn } from '../../lib/cn.ts';
import { CONTENT_TYPES } from '../../lib/projectTypes.ts';
import { type ProjectType } from '../../types.ts';

export function ContentTypeTabs({
  activeType,
  onTypeChange,
}: {
  activeType: ProjectType;
  onTypeChange: (type: ProjectType) => void;
}) {
  return (
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
  );
}
