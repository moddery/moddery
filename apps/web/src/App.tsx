import { type MouseEvent } from 'react';

import { AppPages, isHomePage } from './app/AppPages.tsx';
import { useAppShellState } from './app/useAppShellState.ts';
import { AuthControls } from './components/AuthControls.tsx';
import { NavBar } from './components/NavBar.tsx';

export function App() {
  const app = useAppShellState();
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

  if (isHomePage(app)) {
    return <AppPages app={app} onNavigate={handleInternalNavigation} />;
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

      <AppPages app={app} onNavigate={handleInternalNavigation} />
    </div>
  );
}

export default App;
