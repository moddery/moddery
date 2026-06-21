import { type DashboardData } from '../../../lib/dashboard.ts';
import { enumLabel } from '../../../lib/labels.ts';

export function DashboardSummarySections({
  dashboard,
}: {
  dashboard: DashboardData;
}) {
  const recentProjects = dashboard.projects.slice(0, 5);
  const pendingProjects = dashboard.projects.filter(
    (project) => project.status === 'PENDING_REVIEW',
  );
  const draftProjects = dashboard.projects.filter(
    (project) => project.status === 'DRAFT',
  );

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        <OverviewMetric
          label="Managed projects"
          value={dashboard.projectCount}
          detail={`${pendingProjects.length.toLocaleString(
            'en-US',
          )} pending review`}
        />
        <OverviewMetric
          label="Organizations"
          value={dashboard.organizationCount}
          detail="Creator groups you own"
        />
        <OverviewMetric
          label="Collections"
          value={dashboard.collectionCount}
          detail="Curated project lists"
        />
      </section>

      <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink">
              What needs attention
            </h2>
            <p className="mt-1 text-sm text-muted">
              A compact view of creator work that is not fully public yet.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <AttentionCard
            count={pendingProjects.length}
            label="Projects in review"
            empty="No projects waiting on moderation."
          />
          <AttentionCard
            count={draftProjects.length}
            label="Draft projects"
            empty="No draft projects."
          />
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink">
              Recent projects
            </h2>
            <p className="mt-1 text-sm text-muted">
              Open Projects for full management, releases, members, and
              metadata.
            </p>
          </div>
        </div>
        {recentProjects.length === 0 ? (
          <p className="py-8 text-sm text-muted">
            Publish a project to start managing it here.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {recentProjects.map((project) => (
              <li
                key={project.slug}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-ink">
                    {project.title}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted">
                    {enumLabel(project.kind)} · {enumLabel(project.status)}
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-control px-2 py-1 text-xs font-bold text-muted">
                  {project.downloads.toLocaleString('en-US')} downloads
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function OverviewMetric({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-ink tabular-nums">
        {value.toLocaleString('en-US')}
      </p>
      <p className="mt-1 text-sm font-semibold text-muted">{detail}</p>
    </div>
  );
}

function AttentionCard({
  count,
  empty,
  label,
}: {
  count: number;
  empty: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-ink">{label}</p>
        <span className="rounded-md bg-control px-2 py-1 text-xs font-bold text-muted tabular-nums">
          {count.toLocaleString('en-US')}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">
        {count === 0 ? empty : 'Open Projects to continue work.'}
      </p>
    </div>
  );
}
