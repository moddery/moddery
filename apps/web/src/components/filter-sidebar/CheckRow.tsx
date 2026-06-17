import { type ReactNode } from 'react';

import { cn } from '../../lib/cn.ts';

export function CheckRow({
  checked,
  onToggle,
  description,
  label,
  icon,
}: {
  checked: boolean;
  onToggle: () => void;
  description?: string | null;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onToggle}
      className={cn(
        'group flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted transition-colors hover:bg-control-hover hover:text-ink',
        checked && 'bg-accent-selected text-ink hover:bg-accent-selected',
      )}
    >
      <span className="flex min-w-0 items-start gap-2.5">
        {icon}
        <span className="min-w-0">
          <span className="block truncate">{label}</span>
          {description ? (
            <span className="block truncate text-xs font-normal text-faint group-hover:text-muted">
              {description}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}
