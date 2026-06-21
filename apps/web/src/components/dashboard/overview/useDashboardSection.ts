import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_DASHBOARD_SECTION,
  isDashboardSectionId,
  type DashboardSectionId,
} from './dashboardSectionItems.ts';

function readSectionFromHash(): DashboardSectionId {
  const raw = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  return isDashboardSectionId(raw) ? raw : DEFAULT_DASHBOARD_SECTION;
}

/**
 * Tracks the active dashboard section in the URL hash so sections behave like
 * real navigation (only the active pane renders) while keeping the existing
 * shareable `/dashboard#section` links working, including back/forward.
 */
export function useDashboardSection(
  availableIds: readonly DashboardSectionId[],
) {
  const [activeId, setActiveId] = useState<DashboardSectionId>(() =>
    readSectionFromHash(),
  );

  useEffect(() => {
    function syncFromHash() {
      setActiveId(readSectionFromHash());
    }

    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, []);

  const selectSection = useCallback((id: DashboardSectionId) => {
    const url = new URL(window.location.href);
    url.hash = id;
    window.history.pushState(null, '', url);
    setActiveId(id);
  }, []);

  // Clamp to a section the viewer can actually see (e.g. moderation may be
  // hidden), without rewriting the URL the user landed on.
  const resolvedId = availableIds.includes(activeId)
    ? activeId
    : DEFAULT_DASHBOARD_SECTION;

  return { activeId: resolvedId, selectSection };
}
