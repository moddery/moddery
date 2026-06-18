import { type DashboardData } from '../../../../lib/dashboard.ts';
import { OrganizationRow } from '../../ContentManagementPanels.tsx';

export function OrganizationsSummary({
  dashboard,
  onOpenOrganization,
}: {
  dashboard: DashboardData;
  onOpenOrganization?: (slug: string) => void;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Organizations
        </h2>
        <span className="text-sm font-semibold text-muted">
          {dashboard.organizations.length.toLocaleString('en-US')} total
        </span>
      </div>

      {dashboard.organizations.length === 0 ? (
        <p className="py-8 text-sm text-muted">
          Creator groups you own will show up here.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {dashboard.organizations.map((organization) => (
            <OrganizationRow
              key={organization.id}
              onOpenOrganization={onOpenOrganization}
              organization={organization}
            />
          ))}
        </div>
      )}
    </section>
  );
}
