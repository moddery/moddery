import { lazy, Suspense, type MouseEvent } from 'react';

import { useAppShellState } from './app/useAppShellState.ts';
import { AuthControls } from './components/AuthControls.tsx';
import { NavBar } from './components/NavBar.tsx';
import { projectTypeMeta } from './lib/projectTypes.ts';

const CollectionDetailPage = lazy(() =>
  import('./components/CollectionDetailPage.tsx').then((module) => ({
    default: module.CollectionDetailPage,
  })),
);
const CollectionsPage = lazy(() =>
  import('./components/CollectionsPage.tsx').then((module) => ({
    default: module.CollectionsPage,
  })),
);
const DashboardPage = lazy(() =>
  import('./components/DashboardPage.tsx').then((module) => ({
    default: module.DashboardPage,
  })),
);
const DiscoverPage = lazy(() =>
  import('./components/discover/DiscoverPage.tsx').then((module) => ({
    default: module.DiscoverPage,
  })),
);
const HomePage = lazy(() =>
  import('./components/HomePage.tsx').then((module) => ({
    default: module.HomePage,
  })),
);
const NotificationsPage = lazy(() =>
  import('./components/NotificationsPage.tsx').then((module) => ({
    default: module.NotificationsPage,
  })),
);
const OrganizationPage = lazy(() =>
  import('./components/OrganizationPage.tsx').then((module) => ({
    default: module.OrganizationPage,
  })),
);
const ProjectPage = lazy(() =>
  import('./components/ProjectPage.tsx').then((module) => ({
    default: module.ProjectPage,
  })),
);
const UserProfilePage = lazy(() =>
  import('./components/UserProfilePage.tsx').then((module) => ({
    default: module.UserProfilePage,
  })),
);
const UsersPage = lazy(() =>
  import('./components/UsersPage.tsx').then((module) => ({
    default: module.UsersPage,
  })),
);

export function App() {
  const app = useAppShellState();
  const meta = projectTypeMeta(app.projectType);
  const handleInternalNavigation = (event: MouseEvent<HTMLElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target;
    const anchor = target instanceof Element ? target.closest('a[href]') : null;
    if (!(anchor instanceof HTMLAnchorElement)) return;
    if (anchor.target && anchor.target !== '_self') return;

    const url = new URL(anchor.href);
    if (!app.navigateToUrl(url)) return;

    event.preventDefault();
    event.stopPropagation();
  };

  if (app.appView === 'home' && !app.selectedProject) {
    return (
      <Suspense fallback={<PageLoading />}>
        <HomePage
          onDiscover={app.openDiscover}
          onOpenCollection={(collection) =>
            app.openCollection({
              ownerUsername: collection.owner.username,
              slug: collection.slug,
            })
          }
          onOpenNotifications={app.openNotifications}
          onOpenProject={app.openProject}
          onOpenProfile={app.openProfile}
          onTagSearch={app.searchByTag}
          onNavigate={handleInternalNavigation}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-dvh bg-bg" onClickCapture={handleInternalNavigation}>
      <NavBar
        activeType={app.projectType}
        onTypeChange={app.changeProjectType}
        onHome={app.openHome}
        onDiscover={app.openDiscover}
        onCollections={app.openCollections}
        onUsers={app.openUsers}
        onOrganizations={app.openOrganizations}
        onDashboard={app.openDashboard}
        isDiscoverActive={
          app.appView === 'discover' || Boolean(app.selectedProject)
        }
        isCollectionsActive={app.appView === 'collections'}
        isUsersActive={app.appView === 'users' || app.appView === 'profile'}
        isOrganizationsActive={app.appView === 'organization'}
        showContentTabs={
          app.appView === 'discover' || Boolean(app.selectedProject)
        }
        accountSlot={
          <AuthControls
            onOpenNotifications={app.openNotifications}
            onOpenProfile={app.openProfile}
          />
        }
      />

      <Suspense fallback={<PageLoading />}>
        {app.selectedProject ? (
          <ProjectPage
            slug={app.selectedProject.slug}
            projectTypeHint={app.selectedProject.projectType}
            onBack={app.closeProject}
            onTagSearch={app.searchByTag}
          />
        ) : app.appView === 'collections' ? (
          app.selectedCollection ? (
            <CollectionDetailPage
              ownerUsername={app.selectedCollection.ownerUsername}
              slug={app.selectedCollection.slug}
              onBack={app.openCollections}
              onOpenProject={app.openProject}
              onTagSearch={app.searchByTag}
            />
          ) : (
            <CollectionsPage
              onOpenCollection={(collection) =>
                app.openCollection({
                  ownerUsername: collection.owner.username,
                  slug: collection.slug,
                })
              }
              onOpenProject={app.openProject}
              onTagSearch={app.searchByTag}
            />
          )
        ) : app.appView === 'dashboard' ? (
          <DashboardPage
            onOpenCollection={app.openCollection}
            onOpenProject={app.openProject}
          />
        ) : app.appView === 'notifications' ? (
          <NotificationsPage />
        ) : app.appView === 'users' ? (
          <UsersPage onOpenProject={app.openProject} />
        ) : app.appView === 'organization' ? (
          <OrganizationPage
            slug={app.selectedOrganization}
            onOpenProject={app.openProject}
          />
        ) : app.appView === 'profile' && app.selectedUsername ? (
          <UserProfilePage
            username={app.selectedUsername}
            onOpenCollection={app.openCollection}
            onOpenProject={app.openProject}
          />
        ) : (
          <DiscoverPage
            activeFilterCount={app.discover.activeFilterCount}
            categoryOptions={app.discover.categoryOptions}
            clearAll={app.discover.clearAll}
            error={app.discover.error}
            hasActiveFilters={app.discover.hasActiveFilters}
            layout={app.discover.layout}
            loaderOptions={app.discover.loaderOptions}
            loading={app.discover.loading}
            meta={meta}
            mobileFiltersOpen={app.discover.mobileFiltersOpen}
            mods={app.discover.mods}
            onOpenProject={app.openProject}
            onPage={app.discover.setPage}
            onTagSearch={app.searchByTag}
            page={app.discover.page}
            query={app.discover.query}
            selectedCategories={app.discover.selectedCategories}
            selectedLoaders={app.discover.selectedLoaders}
            selectedTags={app.discover.selectedTags}
            selectedVersions={app.discover.selectedVersions}
            setLayout={app.discover.setLayout}
            setMobileFiltersOpen={app.discover.setMobileFiltersOpen}
            setQuery={(value) => {
              app.discover.setQuery(value);
              app.discover.setPage(1);
            }}
            setSort={(value) => {
              app.discover.setSort(value);
              app.discover.setPage(1);
            }}
            setView={(value) => {
              app.discover.setView(value);
              app.discover.setPage(1);
            }}
            sort={app.discover.sort}
            tagOptions={app.discover.tagOptions}
            toggleCategory={app.discover.toggleCategory}
            toggleLoader={app.discover.toggleLoader}
            toggleTag={app.discover.toggleTag}
            toggleVersion={app.discover.toggleVersion}
            total={app.discover.total}
            totalPages={app.discover.totalPages}
            versionOptions={app.discover.versionOptions}
            view={app.discover.view}
          />
        )}
      </Suspense>
    </div>
  );
}

function PageLoading() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded bg-surface-2" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-surface-2" />
      <div className="mt-2 h-4 w-full max-w-md animate-pulse rounded bg-surface-2" />
    </main>
  );
}

export default App;
