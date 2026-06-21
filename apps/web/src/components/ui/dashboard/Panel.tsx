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
