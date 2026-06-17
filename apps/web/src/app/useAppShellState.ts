import { useEffect, useState } from 'react';

import { type SearchTag } from '../components/ModCard.tsx';
import { useDiscoverState } from '../components/discover/useDiscoverState.ts';
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
  writeProjectListToUrl,
  writeProjectToUrl,
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
  const discover = useDiscoverState({ projectType, shouldLoadCatalog });

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
