import {
  Building2,
  FolderKanban,
  LayoutGrid,
  Library,
  ShieldCheck,
  UserCog,
  type LucideIcon,
} from 'lucide-react';

export type DashboardSectionId =
  | 'dashboard-overview'
  | 'dashboard-projects'
  | 'dashboard-content'
  | 'dashboard-collections'
  | 'dashboard-account'
  | 'dashboard-security'
  | 'dashboard-moderation';

export interface DashboardSectionNavItem {
  count?: number;
  icon: LucideIcon;
  id: DashboardSectionId;
  label: string;
}

export const DEFAULT_DASHBOARD_SECTION: DashboardSectionId =
  'dashboard-overview';

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
    { icon: LayoutGrid, id: 'dashboard-overview', label: 'Overview' },
    {
      count: projectCount,
      icon: FolderKanban,
      id: 'dashboard-projects',
      label: 'Projects',
    },
    {
      count: organizationCount,
      icon: Building2,
      id: 'dashboard-content',
      label: 'Organizations',
    },
    {
      count: collectionCount,
      icon: Library,
      id: 'dashboard-collections',
      label: 'Collections',
    },
    { icon: UserCog, id: 'dashboard-account', label: 'Account' },
    { icon: ShieldCheck, id: 'dashboard-security', label: 'Security' },
  ];

  if (canModerate) {
    items.push({
      icon: ShieldCheck,
      id: 'dashboard-moderation',
      label: 'Moderation',
    });
  }

  return items;
}

export function isDashboardSectionId(
  value: string,
): value is DashboardSectionId {
  return (
    value === 'dashboard-overview' ||
    value === 'dashboard-projects' ||
    value === 'dashboard-content' ||
    value === 'dashboard-collections' ||
    value === 'dashboard-account' ||
    value === 'dashboard-security' ||
    value === 'dashboard-moderation'
  );
}
