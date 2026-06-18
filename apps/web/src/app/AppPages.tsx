import { lazy, Suspense } from 'react';

import { DiscoverRoute } from './routes/DiscoverRoute.tsx';
import { type useAppShellState } from './useAppShellState.ts';
import { PageLoading } from './PageLoading.tsx';

const CollectionDetailPage = lazy(() =>
  import('../components/CollectionDetailPage.tsx').then((module) => ({
    default: module.CollectionDetailPage,
  })),
);
const CollectionsPage = lazy(() =>
  import('../components/CollectionsPage.tsx').then((module) => ({
    default: module.CollectionsPage,
  })),
);
const DashboardPage = lazy(() =>
  import('../components/DashboardPage.tsx').then((module) => ({
    default: module.DashboardPage,
  })),
);
const HomePage = lazy(() =>
  import('../components/HomePage.tsx').then((module) => ({
    default: module.HomePage,
  })),
);
const NotificationsPage = lazy(() =>
  import('../components/NotificationsPage.tsx').then((module) => ({
    default: module.NotificationsPage,
  })),
);
const OrganizationPage = lazy(() =>
  import('../components/OrganizationPage.tsx').then((module) => ({
    default: module.OrganizationPage,
  })),
);
const PlatformPage = lazy(() =>
  import('../components/PlatformPage.tsx').then((module) => ({
    default: module.PlatformPage,
  })),
);
const ProjectPage = lazy(() =>
  import('../components/ProjectPage.tsx').then((module) => ({
    default: module.ProjectPage,
  })),
);
const StatusPage = lazy(() =>
  import('../components/StatusPage.tsx').then((module) => ({
    default: module.StatusPage,
  })),
);
const UserProfilePage = lazy(() =>
  import('../components/UserProfilePage.tsx').then((module) => ({
    default: module.UserProfilePage,
  })),
);
const UsersPage = lazy(() =>
  import('../components/UsersPage.tsx').then((module) => ({
    default: module.UsersPage,
  })),
);

type AppShellState = ReturnType<typeof useAppShellState>;

type AppPagesProps = {
  app: AppShellState;
};

export function isHomePage(app: AppShellState) {
  return app.appView === 'home' && !app.selectedProject;
}

export function AppPages({ app }: AppPagesProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      {isHomePage(app) ? (
        <HomePage
          onDiscover={app.openDiscover}
          onOpenCollection={(collection) =>
            app.openCollection({
              ownerUsername: collection.owner.username,
              slug: collection.slug,
            })
          }
          onOpenProject={app.openProject}
          onTagSearch={app.searchByTag}
        />
      ) : app.selectedProject ? (
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
      ) : app.appView === 'platform' ? (
        <PlatformPage />
      ) : app.appView === 'status' ? (
        <StatusPage />
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
          onTagSearch={app.searchByTag}
        />
      ) : (
        <DiscoverRoute app={app} />
      )}
    </Suspense>
  );
}
