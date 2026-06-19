import { type SortKey } from '../../lib/catalog.ts';
import { projectTypeMeta } from '../../lib/projectTypes.ts';
import { type ProjectType } from '../../types.ts';
import { type DiscoverFilterSelection } from './useDiscoverFilters.ts';

export interface DiscoverUrlState {
  filters: DiscoverFilterSelection;
  page: number;
  query: string;
  sort: SortKey;
  view: string;
}

export function readDiscoverUrlState(): DiscoverUrlState {
  const params = new URLSearchParams(window.location.search);

  return {
    filters: {
      categories: params.getAll('category'),
      licenses: params.getAll('license'),
      loaders: params.getAll('loader'),
      versions: params.getAll('version'),
    },
    page: readPositiveInteger(params.get('page'), 1),
    query: params.get('q') ?? '',
    sort: readSort(params.get('sort')),
    view: readView(params.get('view')),
  };
}

export function writeDiscoverUrlState({
  categories,
  loaders,
  licenses,
  page,
  projectType,
  query,
  sort,
  versions,
  view,
}: {
  categories: string[];
  loaders: string[];
  licenses: string[];
  page: number;
  projectType: ProjectType;
  query: string;
  sort: SortKey;
  versions: string[];
  view: string;
}) {
  const url = new URL(window.location.href);
  url.pathname = `/${projectTypeMeta(projectType).path}`;
  url.searchParams.delete('project');
  url.searchParams.delete('type');
  url.searchParams.delete('tab');
  setOptionalParam(url, 'q', query.trim());
  setOptionalParam(url, 'sort', sort === 'relevance' ? '' : sort);
  setOptionalParam(url, 'view', view === '20' ? '' : view);
  setOptionalParam(url, 'page', page === 1 ? '' : String(page));
  setListParam(url, 'version', versions);
  setListParam(url, 'loader', loaders);
  setListParam(url, 'license', licenses);
  setListParam(url, 'category', categories);

  window.history.replaceState(null, '', url);
}

function readPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function readSort(value: string | null): SortKey {
  if (
    value === 'downloads' ||
    value === 'follows' ||
    value === 'updated' ||
    value === 'name'
  ) {
    return value;
  }

  return 'relevance';
}

function readView(value: string | null): string {
  return value === '5' || value === '10' || value === '20' ? value : '20';
}

function setOptionalParam(url: URL, key: string, value: string) {
  if (value) {
    url.searchParams.set(key, value);
    return;
  }

  url.searchParams.delete(key);
}

function setListParam(url: URL, key: string, values: string[]) {
  url.searchParams.delete(key);
  values.forEach((value) => {
    url.searchParams.append(key, value);
  });
}
