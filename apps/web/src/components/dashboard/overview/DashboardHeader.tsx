import { Building2, FolderKanban, Heart, ShieldCheck } from 'lucide-react';
import { type ReactNode } from 'react';

import { userPath } from '../../../app/routing.ts';
import { type DashboardData } from '../../../lib/dashboard.ts';
import { useDashboardModal } from '../modals/DashboardModalProvider.tsx';
import { dashboardHeaderStats } from './dashboard-header-stats.ts';

export function DashboardHeader({ dashboard }: { dashboard: DashboardData }) {
  const displayName = dashboard.displayName ?? dashboard.username;
  const stats = dashboardHeaderStats(dashboard);
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

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <DashboardStat
          icon={<FolderKanban className="size-4" />}
          label="Projects"
          value={stats.projects}
        />
        <DashboardStat
          icon={<Building2 className="size-4" />}
          label="Organizations"
          value={stats.organizations}
        />
        <DashboardStat
          icon={<Heart className="size-4" />}
          label="Following"
          value={stats.following}
        />
      </div>
    </header>
  );
}

function DashboardStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-3">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <div className="mt-1 text-lg font-extrabold text-ink tabular-nums">
        {value.toLocaleString('en-US')}
      </div>
    </div>
  );
}
