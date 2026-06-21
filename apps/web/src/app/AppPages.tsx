import { lazy, Suspense } from 'react';

import { DiscoverRoute } from './routes/DiscoverRoute.tsx';
import { type useAppShellState } from './useAppShellState.ts';
import { AuthRequiredPage } from './AuthRequiredPage.tsx';
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
const LegalPage = lazy(() =>
  import('../components/LegalPage.tsx').then((module) => ({
    default: module.LegalPage,
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
  onRequestAuth: () => void;
};

export function isHomePage(app: AppShellState) {
  return app.appView === 'home' && !app.selectedProject;
}

export function AppPages({ app, onRequestAuth }: AppPagesProps) {
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
          onRequestAuth={onRequestAuth}
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
        <AuthRequiredPage
          title="Sign in to open your dashboard"
          description="Manage your projects, releases, teams, collections, account settings, and moderation work from one private workspace."
          onRequestAuth={onRequestAuth}
        >
          <DashboardPage
            editTarget={app.dashboardEdit}
            onCloseEdit={app.closeDashboardEdit}
            onHome={app.openHome}
            onOpenCollection={app.openCollection}
            onOpenOrganization={app.openOrganization}
            onOpenProject={app.openProject}
            onOpenProjectReference={app.openProjectReference}
            onOpenEdit={app.openDashboardEdit}
            onTagSearch={app.searchByTag}
          />
        </AuthRequiredPage>
      ) : app.appView === 'notifications' ? (
        <AuthRequiredPage
          title="Sign in to view notifications"
          description="Notifications include project review updates, team invitations, direct messages, and account events."
          onRequestAuth={onRequestAuth}
        >
          <NotificationsPage />
        </AuthRequiredPage>
      ) : app.appView === 'platform' ? (
        <PlatformPage />
      ) : app.appView === 'status' ? (
        <StatusPage />
      ) : app.appView === 'terms' ? (
        <LegalPage page="terms" />
      ) : app.appView === 'privacy' ? (
        <LegalPage page="privacy" />
      ) : app.appView === 'safety' ? (
        <LegalPage page="safety" />
      ) : app.appView === 'users' ? (
        <UsersPage
          onHome={app.openHome}
          onOpenProject={app.openProject}
          onTagSearch={app.searchByTag}
        />
      ) : app.appView === 'organization' ? (
        <OrganizationPage
          slug={app.selectedOrganization}
          onHome={app.openHome}
          onOrganizations={app.openOrganizations}
          onOpenProject={app.openProject}
          onTagSearch={app.searchByTag}
        />
      ) : app.appView === 'profile' && app.selectedUsername ? (
        <UserProfilePage
          username={app.selectedUsername}
          onBack={app.openUsers}
          onOpenCollection={app.openCollection}
          onOpenProject={app.openProject}
          onRequestAuth={onRequestAuth}
          onTagSearch={app.searchByTag}
        />
      ) : (
        <DiscoverRoute app={app} />
      )}
    </Suspense>
  );
}
