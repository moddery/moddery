import { ShieldCheck } from 'lucide-react';

import { userPath } from '../../../app/routing.ts';
import { type DashboardData } from '../../../lib/dashboard.ts';
import { useDashboardModal } from '../modals/DashboardModalProvider.tsx';

export function DashboardHeader({ dashboard }: { dashboard: DashboardData }) {
  const displayName = dashboard.displayName ?? dashboard.username;
  const { openModal } = useDashboardModal();

  return (
    <header className="border-b border-line pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Dashboard
          </h1>
          <p className="mt-2 text-sm font-semibold text-muted">
            Managing as{' '}
            <a
              href={userPath(dashboard.username)}
              className="text-ink transition-colors hover:text-accent"
            >
              {displayName}
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openModal('project')}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
          >
            Publish project
          </button>
          <button
            type="button"
            onClick={() => openModal('version')}
            className="inline-flex h-10 items-center rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover"
          >
            Upload version
          </button>
          {dashboard.isAdmin && (
            <a
              href="#dashboard-moderation"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent-soft px-3 text-sm font-bold text-accent transition-colors hover:bg-control-hover"
            >
              <ShieldCheck className="size-4" />
              Moderation
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
