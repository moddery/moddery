import { type ProjectAnalytics } from '../../../lib/catalog.ts';
import { formatCount } from '../../../lib/format.ts';
import { MetaRow } from './MetaRow.tsx';

export function ProjectAnalyticsSection({
  analytics,
}: {
  analytics: ProjectAnalytics;
}) {
  const maxViews = Math.max(1, ...analytics.days.map((day) => day.views));
  const maxDownloads = Math.max(
    1,
    ...analytics.days.map((day) => day.downloads),
  );

  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-extrabold text-ink">
        Analytics
      </h2>
      <div className="mt-3 divide-y divide-line/70">
        <MetaRow
          label="Views, 30 days"
          value={formatCount(analytics.viewsLast30Days, 1)}
        />
        <MetaRow
          label="Downloads, 30 days"
          value={formatCount(analytics.downloadsLast30Days, 1)}
        />
      </div>
      <div className="mt-4 grid grid-cols-[repeat(14,minmax(0,1fr))] items-end gap-1">
        {analytics.days.slice(-14).map((day) => (
          <div key={day.date} className="flex h-16 items-end gap-0.5">
            <span
              title={`${day.views.toLocaleString('en-US')} views`}
              className="w-full rounded-t-sm bg-accent-soft"
              style={{
                height: `${Math.max(8, (day.views / maxViews) * 64).toString()}px`,
              }}
            />
            <span
              title={`${day.downloads.toLocaleString('en-US')} downloads`}
              className="w-full rounded-t-sm bg-accent"
              style={{
                height: `${Math.max(8, (day.downloads / maxDownloads) * 64).toString()}px`,
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
    </section>
  );
}
