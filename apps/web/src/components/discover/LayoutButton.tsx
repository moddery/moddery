import { motion } from 'motion/react';
import { type ReactNode } from 'react';

import { cn } from '../../lib/cn.ts';

export function LayoutButton({
  active,
  ariaLabel,
  onClick,
  children,
}: {
  active: boolean;
  ariaLabel: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'relative grid size-9 place-items-center rounded-md transition-colors',
        active ? 'text-accent-icon' : 'text-faint hover:text-accent-icon',
      )}
    >
      {active && (
        <motion.span
          layoutId="layoutToggleIndicator"
          className="absolute inset-0 rounded-md bg-control-hover"
          transition={{ type: 'spring', stiffness: 520, damping: 40 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
