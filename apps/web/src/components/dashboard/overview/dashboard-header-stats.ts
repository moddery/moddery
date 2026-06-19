import { type DashboardData } from '../../../lib/dashboard.ts';

export function dashboardHeaderStats(
  dashboard: Pick<
    DashboardData,
    'followedProjectCount' | 'organizationCount' | 'projectCount'
  >,
) {
  return {
    following: dashboard.followedProjectCount,
    organizations: dashboard.organizationCount,
    projects: dashboard.projectCount,
  };
}
