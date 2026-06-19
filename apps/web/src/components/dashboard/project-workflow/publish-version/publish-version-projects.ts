import { type DashboardData } from '../../../../lib/dashboard.ts';

export function publishableVersionProjects(
  projects: DashboardData['projects'],
): DashboardData['projects'] {
  return projects.filter((project) => project.status === 'APPROVED');
}
