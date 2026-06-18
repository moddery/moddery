import { type ReactNode } from 'react';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

export function MetaRow({
  href,
  label,
  value,
  icon,
}: {
  href?: string | null;
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
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-w-0 items-center gap-1 truncate text-right font-bold text-ink no-underline transition-colors hover:text-accent"
        >
          <span className="truncate">{value}</span>
          <ExternalLinkIcon className="size-3 shrink-0 text-accent-icon" />
        </a>
      ) : (
        <span className="min-w-0 truncate text-right font-bold text-ink">
          {value}
        </span>
      )}
    </div>
  );
}
