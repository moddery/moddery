import { type ProjectAnalytics } from '../../../../lib/catalog.ts';
import { formatCount } from '../../../../lib/format.ts';

export function ProjectAnalyticsSummary({
  analytics,
}: {
  analytics: ProjectAnalytics;
}) {
  return (
    <div className="mt-4 grid gap-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Views, 30 days" value={analytics.viewsLast30Days} />
        <Metric
          label="Downloads, 30 days"
          value={analytics.downloadsLast30Days}
        />
        <Metric label="All-time views" value={analytics.totalViews} />
        <Metric label="All-time downloads" value={analytics.totalDownloads} />
      </div>
      <AnalyticsBars analytics={analytics} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-3">
      <div className="text-xs font-bold uppercase tracking-[0.08em] text-muted">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-extrabold text-ink">
        {formatCount(value, 1)}
      </div>
    </div>
  );
}

function AnalyticsBars({ analytics }: { analytics: ProjectAnalytics }) {
  const days = analytics.days.slice(-30);
  const maxValue = Math.max(
    1,
    ...days.map((day) => Math.max(day.views, day.downloads)),
  );

  return (
    <div>
      <div className="flex h-44 items-end gap-1 rounded-lg border border-line bg-surface px-3 pb-3 pt-4">
        {days.map((day) => (
          <div
            key={day.date}
            className="flex h-full min-w-0 flex-1 items-end gap-0.5"
          >
            <span
              title={`${day.date}: ${day.views.toLocaleString('en-US')} views`}
              className="w-full rounded-t-sm bg-accent-soft"
              style={{
                height: barHeight(day.views, maxValue),
              }}
            />
            <span
              title={`${day.date}: ${day.downloads.toLocaleString(
                'en-US',
              )} downloads`}
              className="w-full rounded-t-sm bg-accent"
              style={{
                height: barHeight(day.downloads, maxValue),
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-muted">
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-sm bg-accent-soft" />
          Views
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-sm bg-accent" />
          Downloads
        </span>
      </div>
    </div>
  );
}

function barHeight(value: number, maxValue: number): string {
  if (value === 0) return '4px';

  return `${Math.max(8, (value / maxValue) * 128).toString()}px`;
}
