import { type DashboardSectionNavItem } from './DashboardSectionNav.tsx';

export function dashboardSectionItems({
  canModerate,
  collectionCount,
  organizationCount,
  projectCount,
}: {
  canModerate: boolean;
  collectionCount: number;
  organizationCount: number;
  projectCount: number;
}): DashboardSectionNavItem[] {
  const items: DashboardSectionNavItem[] = [
    { id: 'dashboard-account', label: 'Account' },
    { id: 'dashboard-security', label: 'Security' },
    {
      count: organizationCount,
      id: 'dashboard-content',
      label: 'Organizations',
    },
    { count: projectCount, id: 'dashboard-projects', label: 'Projects' },
    {
      count: collectionCount,
      id: 'dashboard-collections',
      label: 'Collections',
    },
    { id: 'dashboard-overview', label: 'Overview' },
  ];

  if (canModerate) {
    items.splice(items.length - 1, 0, {
      id: 'dashboard-moderation',
      label: 'Moderation',
    });
  }

  return items;
}
