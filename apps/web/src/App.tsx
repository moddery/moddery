import { type MouseEvent } from 'react';

import { AppPages, isHomePage } from './app/AppPages.tsx';
import { useAppShellState } from './app/useAppShellState.ts';
import { AuthControls } from './components/AuthControls.tsx';
import { NavBar } from './components/NavBar.tsx';

export function App() {
  const app = useAppShellState();
  const homePage = isHomePage(app);
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

  return (
    <div className="min-h-dvh bg-bg" onClickCapture={handleInternalNavigation}>
      <NavBar
        activeType={app.projectType}
        onTypeChange={app.changeProjectType}
        onDashboard={app.openDashboard}
        isDiscoverActive={
          app.appView === 'discover' || Boolean(app.selectedProject)
        }
        isCollectionsActive={app.appView === 'collections'}
        isUsersActive={app.appView === 'users' || app.appView === 'profile'}
        isOrganizationsActive={app.appView === 'organization'}
        isPlatformActive={app.appView === 'platform'}
        isStatusActive={app.appView === 'status'}
        showContentTabs={
          !homePage &&
          (app.appView === 'discover' || Boolean(app.selectedProject))
        }
        showDashboardButton={!homePage}
        showPrimaryNav={!homePage}
        extraActions={
          homePage ? (
            <button
              type="button"
              onClick={app.openDiscover}
              className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
            >
              Explore
            </button>
          ) : undefined
        }
        accountSlot={
          <AuthControls
            onOpenNotifications={app.openNotifications}
            onOpenProfile={app.openProfile}
          />
        }
      />

      <AppPages app={app} />
    </div>
  );
}

export default App;
