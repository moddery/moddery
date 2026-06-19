import type { ReactNode } from 'react';
import { cn } from '../lib/cn.ts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function pageList(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | '…')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push('…');
  for (let p = start; p <= end; p++) out.push(p);
  if (end < total - 1) out.push('…');
  out.push(total);
  return out;
}

function PagerButton({
  children,
  ariaLabel,
  disabled,
  onClick,
}: {
  children: ReactNode;
  ariaLabel: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-lg bg-control text-muted transition-colors hover:bg-control-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-control disabled:hover:text-muted"
    >
      {children}
    </button>
  );
}

export function Pagination({
  disabled,
  page,
  totalPages,
  onPage,
}: {
  disabled?: boolean;
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  if (totalPages < 1) return null;
  const pages = pageList(page, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <PagerButton
        ariaLabel="Previous page"
        disabled={disabled || page <= 1}
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft className="size-4" />
      </PagerButton>

      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`ellipsis-${i}`}
            className="grid size-9 place-items-center text-faint"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            disabled={disabled}
            onClick={() => onPage(p)}
            className={cn(
              'grid size-9 place-items-center rounded-lg text-sm font-bold tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-40',
              p === page
                ? 'bg-accent text-white'
                : 'text-muted hover:bg-control-hover hover:text-ink',
            )}
          >
            {p}
          </button>
        ),
      )}

      <PagerButton
        ariaLabel="Next page"
        disabled={disabled || page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        <ChevronRight className="size-4" />
      </PagerButton>
    </nav>
  );
}
