import { apolloClient } from '../../../apollo.js';
import { DASHBOARD_QUERY } from '../graphql.js';
import { type DashboardQueryData } from '../internal-types.js';
import { type DashboardData } from '../types.js';

export async function fetchDashboard(
  signal?: AbortSignal,
): Promise<DashboardData | null> {
  const { data } = await apolloClient.query<DashboardQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: DASHBOARD_QUERY,
  });

  if (data.viewer === null) return null;

  return {
    ...data.viewer,
    organizations: data.viewerOrganizations,
  };
}
