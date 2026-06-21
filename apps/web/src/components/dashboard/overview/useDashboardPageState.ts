import { useQuery } from '@tanstack/react-query';

import { fetchDashboard } from '../../../lib/dashboard.ts';

export function useDashboardPageState() {
  const dashboardQuery = useQuery({
    queryFn: () => fetchDashboard(),
    queryKey: ['dashboard'],
    retry: false,
  });
  const dashboard = dashboardQuery.data;
  const canModerate =
    dashboard?.role === 'ADMIN' || dashboard?.role === 'MODERATOR';
  const canAdmin = dashboard?.role === 'ADMIN';

  async function refreshDashboard() {
    await dashboardQuery.refetch();
  }

  return {
    canAdmin,
    canModerate,
    dashboard,
    dashboardQuery,
    refreshDashboard,
  };
}
