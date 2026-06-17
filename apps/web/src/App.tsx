import { useAppShellState } from './app/useAppShellState.ts';
import { AuthControls } from './components/AuthControls.tsx';
import { CollectionsPage } from './components/CollectionsPage.tsx';
import { DashboardPage } from './components/DashboardPage.tsx';
import { DiscoverPage } from './components/discover/DiscoverPage.tsx';
import { HomePage } from './components/HomePage.tsx';
import { NavBar } from './components/NavBar.tsx';
import { OrganizationPage } from './components/OrganizationPage.tsx';
import { ProjectPage } from './components/ProjectPage.tsx';
import { UserProfilePage } from './components/UserProfilePage.tsx';
import { projectTypeMeta } from './lib/projectTypes.ts';

export function App() {
  const app = useAppShellState();
  const meta = projectTypeMeta(app.projectType);

  if (app.appView === 'home' && !app.selectedProject) {
    return <HomePage onDiscover={app.openDiscover} />;
  }

  return (
    <div className="min-h-dvh bg-bg">
      <NavBar
        activeType={app.projectType}
        onTypeChange={app.changeProjectType}
        onHome={app.openHome}
        onDiscover={app.openDiscover}
        onCollections={app.openCollections}
        onOrganizations={app.openOrganizations}
        onDashboard={app.openDashboard}
        isDiscoverActive={
          app.appView === 'discover' || Boolean(app.selectedProject)
        }
        isCollectionsActive={app.appView === 'collections'}
        isOrganizationsActive={app.appView === 'organization'}
        showContentTabs={
          app.appView === 'discover' || Boolean(app.selectedProject)
        }
        accountSlot={<AuthControls />}
      />

      {app.selectedProject ? (
        <ProjectPage
          slug={app.selectedProject.slug}
          projectTypeHint={app.selectedProject.projectType}
          onBack={app.closeProject}
          onTagSearch={app.searchByTag}
        />
      ) : app.appView === 'collections' ? (
        <CollectionsPage
          onOpenProject={app.openProject}
          onTagSearch={app.searchByTag}
        />
      ) : app.appView === 'dashboard' ? (
        <DashboardPage onOpenProject={app.openProject} />
      ) : app.appView === 'organization' ? (
        <OrganizationPage
          slug={app.selectedOrganization}
          onOpenProject={app.openProject}
        />
      ) : app.appView === 'profile' && app.selectedUsername ? (
        <UserProfilePage
          username={app.selectedUsername}
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
    </div>
  );
}

export default App;
