import { useEffect, useState } from 'react';

import { type SearchTag } from '../components/ModCard.tsx';
import { useDiscoverState } from '../components/discover/useDiscoverState.ts';
import { CONTENT_TYPES } from '../lib/projectTypes.ts';
import { type Mod, type ProjectType } from '../types.ts';
import {
  collectionFromUrl,
  organizationFromUrl,
  profileFromUrl,
  projectFromUrl,
  projectTypeFromPath,
  viewFromUrl,
  writeCollectionToUrl,
  writeCollectionsToUrl,
  writeDashboardToUrl,
  writeHomeToUrl,
  writeNotificationsToUrl,
  writeOrganizationsToUrl,
  writeProfileToUrl,
  writeProjectListToUrl,
  writeProjectToUrl,
  writeUsersToUrl,
  type AppView,
  type SelectedCollection,
} from './routing.ts';

export function useAppShellState() {
  const [selectedProject, setSelectedProject] = useState(() =>
    projectFromUrl(),
  );
  const [selectedUsername, setSelectedUsername] = useState(() =>
    profileFromUrl(),
  );
  const [selectedOrganization, setSelectedOrganization] = useState(() =>
    organizationFromUrl(),
  );
  const [selectedCollection, setSelectedCollection] = useState(() =>
    collectionFromUrl(),
  );
  const [appView, setAppView] = useState<AppView>(() =>
    projectFromUrl()
      ? 'discover'
      : organizationFromUrl()
        ? 'organization'
        : profileFromUrl()
          ? 'profile'
          : viewFromUrl(),
  );
  const [projectType, setProjectType] = useState<ProjectType>(
    () => projectFromUrl()?.projectType ?? projectTypeFromPath() ?? 'mod',
  );
  const shouldLoadCatalog = appView === 'discover' || Boolean(selectedProject);
  const discover = useDiscoverState({
    projectType,
    shouldLoadCatalog,
    syncUrl: appView === 'discover' && selectedProject === null,
  });

  useEffect(() => {
    function handlePopState() {
      const nextProject = projectFromUrl();
      const nextUsername = profileFromUrl();
      const nextOrganization = organizationFromUrl();
      const nextCollection = collectionFromUrl();
      setSelectedProject(nextProject);
      setSelectedUsername(nextUsername);
      setSelectedOrganization(nextOrganization);
      setSelectedCollection(nextCollection);
      setAppView(resolveView(nextProject, nextOrganization, nextUsername));
      setProjectType(
        nextProject?.projectType ?? projectTypeFromPath() ?? 'mod',
      );
    }

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  function searchByTag(tag: SearchTag) {
    resetSelection('discover');
    discover.setMobileFiltersOpen(false);
    discover.setQuery('');
    discover.setSelectedVersions(new Set());
    discover.setSelectedLoaders(
      tag.kind === 'loader' ? new Set([tag.value]) : new Set(),
    );
    discover.setSelectedCategories(
      tag.kind === 'category' ? new Set([tag.value]) : new Set(),
    );
    discover.setPage(1);
    writeProjectListToUrl(projectType);
    scrollToTop();
  }

  function openProject(mod: Mod) {
    const nextProject = {
      slug: mod.slug,
      projectType: mod.projectType ?? projectType,
    };

    setSelectedProject(nextProject);
    setSelectedUsername(null);
    setSelectedOrganization(null);
    setSelectedCollection(null);
    setAppView('discover');
    setProjectType(nextProject.projectType);
    discover.setMobileFiltersOpen(false);
    writeProjectToUrl(nextProject);
    scrollToTop();
  }

  function closeProject() {
    resetSelection('discover');
    writeProjectListToUrl(projectType);
    scrollToTop();
  }

  function openHome() {
    resetSelection('home');
    writeHomeToUrl();
    scrollToTop();
  }

  function openDiscover() {
    resetSelection('discover');
    setProjectType('mod');
    writeProjectListToUrl('mod');
    scrollToTop();
  }

  function openCollections() {
    resetSelection('collections');
    writeCollectionsToUrl();
    scrollToTop();
  }

  function openUsers() {
    resetSelection('users');
    writeUsersToUrl();
    scrollToTop();
  }

  function openProfile(username: string) {
    resetSelection('profile');
    setSelectedUsername(username);
    writeProfileToUrl(username);
    scrollToTop();
  }

  function openCollection(collection: SelectedCollection) {
    resetSelection('collections');
    setSelectedCollection(collection);
    writeCollectionToUrl(collection);
    scrollToTop();
  }

  function openDashboard() {
    resetSelection('dashboard');
    writeDashboardToUrl();
    scrollToTop();
  }

  function openNotifications() {
    resetSelection('notifications');
    writeNotificationsToUrl();
    scrollToTop();
  }

  function openOrganizations() {
    resetSelection('organization');
    writeOrganizationsToUrl();
    scrollToTop();
  }

  function changeProjectType(nextType: ProjectType) {
    if (nextType === projectType) return;
    setProjectType(nextType);
    resetSelection('discover');
    writeProjectListToUrl(nextType);
    discover.setQuery('');
    discover.resetFilters();
    discover.setPage(1);
    discover.setMobileFiltersOpen(false);
  }

  function navigateToUrl(url: URL): boolean {
    if (url.origin !== window.location.origin) return false;

    const nextProject = projectFromNavigationUrl(url);
    if (nextProject) {
      setSelectedProject(nextProject);
      setSelectedUsername(null);
      setSelectedOrganization(null);
      setSelectedCollection(null);
      setAppView('discover');
      setProjectType(nextProject.projectType);
      discover.setMobileFiltersOpen(false);
      window.history.pushState(null, '', url);
      scrollToTop();
      return true;
    }

    const nextCollection = collectionFromNavigationUrl(url);
    if (nextCollection) {
      resetSelection('collections');
      setSelectedCollection(nextCollection);
      window.history.pushState(null, '', url);
      scrollToTop();
      return true;
    }

    const nextUsername = profileFromNavigationUrl(url);
    if (nextUsername) {
      resetSelection('profile');
      setSelectedUsername(nextUsername);
      window.history.pushState(null, '', url);
      scrollToTop();
      return true;
    }

    const nextOrganization = organizationFromNavigationUrl(url);
    if (nextOrganization) {
      resetSelection('organization');
      setSelectedOrganization(nextOrganization);
      window.history.pushState(null, '', url);
      scrollToTop();
      return true;
    }

    const nextProjectType = projectTypeFromNavigationUrl(url);
    if (nextProjectType) {
      resetSelection('discover');
      setProjectType(nextProjectType);
      discover.setMobileFiltersOpen(false);
      window.history.pushState(null, '', url);
      discover.applyUrlState();
      scrollToTop();
      return true;
    }

    if (url.pathname === '/') {
      openHome();
      return true;
    }

    if (url.pathname === '/collections') {
      openCollections();
      return true;
    }

    if (url.pathname === '/users') {
      openUsers();
      return true;
    }

    if (url.pathname === '/organizations') {
      openOrganizations();
      return true;
    }

    if (url.pathname === '/dashboard') {
      openDashboard();
      return true;
    }

    if (url.pathname === '/notifications') {
      openNotifications();
      return true;
    }

    return false;
  }

  function resetSelection(nextView: AppView) {
    setSelectedProject(null);
    setSelectedUsername(null);
    setSelectedOrganization(null);
    setSelectedCollection(null);
    setAppView(nextView);
  }

  return {
    appView,
    changeProjectType,
    closeProject,
    discover,
    openCollection,
    openCollections,
    openDashboard,
    openDiscover,
    openHome,
    openNotifications,
    openOrganizations,
    openProject,
    openProfile,
    openUsers,
    navigateToUrl,
    projectType,
    searchByTag,
    selectedCollection,
    selectedOrganization,
    selectedProject,
    selectedUsername,
  };
}

function resolveView(
  selectedProject: unknown,
  selectedOrganization: unknown,
  selectedUsername: unknown,
): AppView {
  if (selectedProject) return 'discover';
  if (selectedOrganization) return 'organization';
  if (selectedUsername) return 'profile';

  return viewFromUrl();
}

function scrollToTop() {
  window.scrollTo({ top: 0 });
}

function projectFromNavigationUrl(url: URL) {
  const slug = url.searchParams.get('project');
  if (!slug) return null;

  return {
    projectType: projectTypeFromNavigationUrl(url) ?? 'mod',
    slug,
  };
}

function collectionFromNavigationUrl(url: URL): SelectedCollection | null {
  const [resource, ownerUsername, slug] = url.pathname
    .split('/')
    .filter(Boolean);
  if (resource !== 'collections' || !ownerUsername || !slug) return null;

  return {
    ownerUsername: decodeURIComponent(ownerUsername),
    slug: decodeURIComponent(slug),
  };
}

function profileFromNavigationUrl(url: URL): string | null {
  const [resource, username] = url.pathname.split('/').filter(Boolean);
  if (resource !== 'users' || !username) return null;

  return decodeURIComponent(username);
}

function organizationFromNavigationUrl(url: URL): string | null {
  const [resource, slug] = url.pathname.split('/').filter(Boolean);
  if (resource !== 'organizations' || !slug) return null;

  return decodeURIComponent(slug);
}

function projectTypeFromNavigationUrl(url: URL): ProjectType | null {
  const type = url.searchParams.get('type');
  if (type && isProjectType(type)) return type;

  const segment = url.pathname.split('/').find(Boolean);
  const meta = CONTENT_TYPES.find((item) => item.path === segment);

  return meta?.type ?? null;
}

function isProjectType(value: string): value is ProjectType {
  return CONTENT_TYPES.some((item) => item.type === value);
}
