import { type ReactNode } from 'react';
import type { ProjectType } from '../types.ts';
import { ContentTypeTabs } from './nav-bar/ContentTypeTabs.tsx';
import { DashboardNavButton } from './nav-bar/DashboardNavButton.tsx';
import { NavBarBrand } from './nav-bar/NavBarBrand.tsx';
import { PrimaryNav } from './nav-bar/PrimaryNav.tsx';

export function NavBar({
  activeType,
  onTypeChange,
  onHome,
  onDiscover,
  onCollections,
  onUsers,
  onOrganizations,
  onDashboard,
  isDiscoverActive,
  isCollectionsActive,
  isUsersActive,
  isOrganizationsActive,
  showContentTabs,
  showDashboardButton = true,
  showPrimaryNav = true,
  extraActions,
  accountSlot,
}: {
  activeType: ProjectType;
  onTypeChange: (type: ProjectType) => void;
  onHome: () => void;
  onDiscover: () => void;
  onCollections: () => void;
  onUsers: () => void;
  onOrganizations: () => void;
  onDashboard: () => void;
  isDiscoverActive: boolean;
  isCollectionsActive: boolean;
  isUsersActive: boolean;
  isOrganizationsActive: boolean;
  showContentTabs: boolean;
  showDashboardButton?: boolean;
  showPrimaryNav?: boolean;
  extraActions?: ReactNode;
  accountSlot?: ReactNode;
}) {
  const primaryItems = buildPrimaryItems({
    isCollectionsActive,
    isDiscoverActive,
    isOrganizationsActive,
    isUsersActive,
    onCollections,
    onDiscover,
    onOrganizations,
    onUsers,
  });

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center gap-4 px-4 sm:px-6">
        <NavBarBrand onHome={onHome} />

        {showPrimaryNav && <PrimaryNav items={primaryItems} />}

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {extraActions}
          {showDashboardButton && (
            <DashboardNavButton onDashboard={onDashboard} />
          )}
          {accountSlot}
        </div>
      </div>

      {showPrimaryNav && <PrimaryNav items={primaryItems} variant="mobile" />}

      {showContentTabs && (
        <ContentTypeTabs activeType={activeType} onTypeChange={onTypeChange} />
      )}
    </header>
  );
}

function buildPrimaryItems({
  isCollectionsActive,
  isDiscoverActive,
  isOrganizationsActive,
  isUsersActive,
  onCollections,
  onDiscover,
  onOrganizations,
  onUsers,
}: {
  isCollectionsActive: boolean;
  isDiscoverActive: boolean;
  isOrganizationsActive: boolean;
  isUsersActive: boolean;
  onCollections: () => void;
  onDiscover: () => void;
  onOrganizations: () => void;
  onUsers: () => void;
}) {
  return [
    {
      active: isDiscoverActive,
      href: '/mods',
      label: 'Discover',
      onClick: onDiscover,
    },
    {
      active: isCollectionsActive,
      href: '/collections',
      label: 'Collections',
      onClick: onCollections,
    },
    {
      active: isUsersActive,
      href: '/users',
      label: 'Creators',
      onClick: onUsers,
    },
    {
      active: isOrganizationsActive,
      href: '/organizations',
      label: 'Organizations',
      onClick: onOrganizations,
    },
  ] as const;
}
