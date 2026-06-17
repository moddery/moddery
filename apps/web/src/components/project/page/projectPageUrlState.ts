import {
  defaultProjectTab,
  projectTabs,
  type ProjectTab,
} from '../ProjectContentTabs.tsx';

export function readProjectTab(): ProjectTab {
  const tab = new URLSearchParams(window.location.search).get('tab');
  return projectTabs.some((item) => item.id === tab)
    ? (tab as ProjectTab)
    : defaultProjectTab;
}

export function readSelectedVersion(): string | null {
  const version = new URLSearchParams(window.location.search).get('version');
  const trimmed = version?.trim() ?? '';

  return trimmed === '' ? null : trimmed;
}

export function writeProjectTab(tab: ProjectTab) {
  const url = new URL(window.location.href);
  if (tab === defaultProjectTab) {
    url.searchParams.delete('tab');
  } else {
    url.searchParams.set('tab', tab);
  }

  if (tab !== 'versions') {
    url.searchParams.delete('version');
  }

  pushProjectPageUrl(url);
}

export function writeSelectedVersion(versionNumber: string | null) {
  const url = new URL(window.location.href);
  url.searchParams.set('tab', 'versions');

  if (versionNumber === null) {
    url.searchParams.delete('version');
  } else {
    url.searchParams.set('version', versionNumber);
  }

  pushProjectPageUrl(url);
}

function pushProjectPageUrl(url: URL) {
  window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
}
