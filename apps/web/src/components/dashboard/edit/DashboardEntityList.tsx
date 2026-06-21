import { ChevronRight } from 'lucide-react';
import { type ReactNode } from 'react';

import { PanelEmptyState } from '../../ui/dashboard/index.ts';

export interface EntityListRow {
  iconUrl?: string | null;
  id: string;
  meta?: string;
  name: string;
}

export function DashboardEntityList({
  emptyBody,
  emptyTitle,
  onEdit,
  rows,
}: {
  emptyBody?: string;
  emptyTitle: string;
  onEdit: (id: string) => void;
  rows: EntityListRow[];
}) {
  if (rows.length === 0) {
    return <PanelEmptyState title={emptyTitle} body={emptyBody} />;
  }

  return (
    <ul className="grid gap-2">
      {rows.map((row) => (
        <li key={row.id}>
          <button
            type="button"
            onClick={() => onEdit(row.id)}
            className="flex w-full items-center gap-3 rounded-lg border border-line bg-control px-3 py-2.5 text-left transition-colors hover:border-line-strong hover:bg-control-hover"
          >
            <EntityIcon iconUrl={row.iconUrl} name={row.name} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-ink">
                {row.name}
              </span>
              {row.meta && (
                <span className="block truncate text-xs font-semibold text-muted">
                  {row.meta}
                </span>
              )}
            </span>
            <span className="text-xs font-bold text-accent">Edit</span>
            <ChevronRight className="size-4 text-faint" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function EntityIcon({
  iconUrl,
  name,
}: {
  iconUrl?: string | null;
  name: string;
}): ReactNode {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt=""
        className="size-9 shrink-0 rounded-md border border-line object-cover"
      />
    );
  }

  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-surface-2 text-sm font-extrabold text-muted">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
