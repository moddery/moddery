import { type DashboardData } from '../../../../lib/dashboard.ts';

export function organizationSummaryTotal(
  dashboard: Pick<DashboardData, 'organizationCount'>,
) {
  return dashboard.organizationCount;
}
