import { ChevronDown } from 'lucide-react';
import { type ReactNode } from 'react';

import { cn } from '../../../lib/cn.ts';

export function DashboardPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-line bg-surface p-5 shadow-sm',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="font-display text-xl font-extrabold text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CollapsiblePanel({
  action,
  children,
  defaultOpen = false,
  description,
  hint,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  title: ReactNode;
}) {
  return (
    <details
      open={defaultOpen || undefined}
      className="group rounded-xl border border-line bg-surface shadow-sm"
    >
      <summary className="flex cursor-pointer select-none items-center justify-between gap-3 p-5 transition-colors hover:bg-surface-2/60 rounded-xl group-open:rounded-b-none [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-extrabold text-ink">
            {title}
          </h2>
          {description && (
            <p className="mt-1 hidden text-sm leading-6 text-muted group-open:block">
              {description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {hint !== undefined && hint !== null && (
            <span className="rounded-md bg-control px-2 py-1 text-xs font-bold text-muted tabular-nums">
              {hint}
            </span>
          )}
          {action && (
            // keeps clicks on header actions from toggling the panel
            <span onClick={(event) => event.preventDefault()}>{action}</span>
          )}
          <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
        </div>
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  );
}

export function FieldGroup({
  children,
  columns = 1,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3;
}) {
  return (
    <div
      className={cn(
        'grid gap-3',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {children}
    </div>
  );
}

export function PanelEmptyState({
  body,
  title,
}: {
  body?: ReactNode;
  title: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-control px-4 py-6 text-center">
      <p className="text-sm font-bold text-ink">{title}</p>
      {body && <p className="mt-1 text-sm leading-6 text-muted">{body}</p>}
    </div>
  );
}
