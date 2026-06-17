import { type ReactNode } from 'react';

export function MetaRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 text-sm">
      <span className="inline-flex items-center gap-2 font-semibold text-muted">
        {icon}
        {label}
      </span>
      <span className="min-w-0 truncate text-right font-bold text-ink">
        {value}
      </span>
    </div>
  );
}
