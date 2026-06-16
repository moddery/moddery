import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { isProjectCategoryTag } from '@moddery/shared';
import type { Mod } from './types.ts';
import { cn } from './lib/cn.ts';
import {
  fetchFilterTags,
  searchProjects,
  type FilterTags,
  type SortKey,
} from './lib/catalog.ts';
import { CONTENT_TYPES, projectTypeMeta } from './lib/projectTypes.ts';
import type { ProjectType } from './types.ts';
import { NavBar } from './components/NavBar.tsx';
import { SearchBar } from './components/SearchBar.tsx';
import {
  FilterSidebar,
  type FacetOption,
  type TagFacetOption,
} from './components/FilterSidebar.tsx';
import { SelectField, type SelectOption } from './components/ui/Select.tsx';
import { ModCard, type Layout, type SearchTag } from './components/ModCard.tsx';
import { ResultsSkeleton } from './components/Skeletons.tsx';
import { EmptyState } from './components/EmptyState.tsx';
import { Pagination } from './components/Pagination.tsx';
import { Filter, LayoutGrid, List } from 'lucide-react';
import { DashboardPage } from './components/DashboardPage.tsx';
import { ProjectPage } from './components/ProjectPage.tsx';
import { HomePage } from './components/HomePage.tsx';
import { AuthControls } from './components/AuthControls.tsx';
import { CollectionsPage } from './components/CollectionsPage.tsx';
import { OrganizationPage } from './components/OrganizationPage.tsx';
import { UserProfilePage } from './components/UserProfilePage.tsx';

type AppView =
  | 'home'
  | 'discover'
  | 'collections'
  | 'dashboard'
  | 'organization'
  | 'profile';

const SORT_OPTIONS: SelectOption[] = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Downloads', value: 'downloads' },
  { label: 'Follows', value: 'follows' },
  { label: 'Recently updated', value: 'updated' },
  { label: 'Name (A-Z)', value: 'name' },
];

const VIEW_OPTIONS: SelectOption[] = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '20', value: '20' },
];

const EMPTY_FILTER_TAGS: FilterTags = {
  categories: [],
  loaders: [],
  versions: [],
};

export function App() {
  const [selectedProject, setSelectedProject] = useState(() =>
    projectFromUrl(),
  );
  const [selectedUsername, setSelectedUsername] = useState(() =>
    profileFromUrl(),
  );
  const [selectedOrganization, setSelectedOrganization] = useState(() =>
    organizationFromUrl(),
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
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('relevance');
  const [view, setView] = useState('20');
  const [layout, setLayout] = useState<Layout>('list');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(
    new Set(),
  );
  const [selectedLoaders, setSelectedLoaders] = useState<Set<string>>(
    new Set(),
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    function handlePopState() {
      const next = projectFromUrl();
      const nextUsername = profileFromUrl();
      const nextOrganization = organizationFromUrl();
      setSelectedProject(next);
      setSelectedUsername(nextUsername);
      setSelectedOrganization(nextOrganization);
      setAppView(
        next
          ? 'discover'
          : nextOrganization
            ? 'organization'
            : nextUsername
              ? 'profile'
              : viewFromUrl(),
      );
      setProjectType(next?.projectType ?? projectTypeFromPath() ?? 'mod');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const selectedVersionValues = useMemo(
    () => [...selectedVersions].sort(),
    [selectedVersions],
  );
  const selectedLoaderValues = useMemo(
    () => [...selectedLoaders].sort(),
    [selectedLoaders],
  );
  const selectedCategoryValues = useMemo(
    () => [...selectedCategories].sort(),
    [selectedCategories],
  );
  const shouldLoadCatalog = appView === 'discover' || Boolean(selectedProject);
  const pageSize = Number(view);

  const filterTagsQuery = useQuery({
    enabled: shouldLoadCatalog,
    queryFn: ({ signal }) => fetchFilterTags(projectType, signal),
    queryKey: ['catalog', 'filter-tags', projectType],
  });
  const projectsQuery = useQuery({
    enabled: shouldLoadCatalog,
    queryFn: ({ signal }) =>
      searchProjects({
        projectType,
        query,
        sort,
        page,
        limit: pageSize,
        versions: selectedVersionValues,
        loaders: selectedLoaderValues,
        categories: selectedCategoryValues,
        signal,
      }),
    queryKey: [
      'catalog',
      'projects',
      projectType,
      query,
      sort,
      page,
      pageSize,
      selectedVersionValues,
      selectedLoaderValues,
      selectedCategoryValues,
    ],
  });

  const filterTags = filterTagsQuery.data ?? EMPTY_FILTER_TAGS;
  const mods = projectsQuery.data?.projects ?? [];
  const total = projectsQuery.data?.totalHits ?? 0;
  const loading = projectsQuery.isLoading || projectsQuery.isFetching;
  const error =
    projectsQuery.error instanceof Error ? projectsQuery.error.message : null;

  const { versionOptions, loaderOptions, categoryOptions } = useMemo(() => {
    return {
      versionOptions: buildOptions(filterTags.versions, selectedVersions),
      loaderOptions: buildOptions(filterTags.loaders, selectedLoaders),
      categoryOptions: buildOptions(filterTags.categories, selectedCategories),
    };
  }, [filterTags, selectedVersions, selectedLoaders, selectedCategories]);
  const tagOptions = useMemo(
    () =>
      buildTagOptions({
        categories: [
          ...filterTags.categories,
          ...mods.flatMap((mod) => mod.categories),
        ],
      }),
    [filterTags, mods],
  );
  const selectedTags = useMemo(
    () =>
      new Set([
        ...selectedCategoriesToTags(selectedCategories),
        ...selectedLoadersToTags(selectedLoaders),
        ...selectedVersionsToTags(selectedVersions),
      ]),
    [selectedCategories, selectedLoaders, selectedVersions],
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const activeFilterCount =
    selectedVersions.size + selectedLoaders.size + selectedCategories.size;
  const hasActiveFilters = query.trim() !== '' || activeFilterCount > 0;

  function toggleIn(
    setter: Dispatch<SetStateAction<Set<string>>>,
    value: string,
  ) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
    setPage(1);
  }

  function clearAll() {
    setQuery('');
    setSelectedVersions(new Set());
    setSelectedLoaders(new Set());
    setSelectedCategories(new Set());
    setPage(1);
  }

  function toggleTag(tag: TagFacetOption) {
    if (tag.kind === 'category') {
      toggleIn(setSelectedCategories, tag.value);
      return;
    }

    if (tag.kind === 'loader') {
      toggleIn(setSelectedLoaders, tag.value);
      return;
    }

    toggleIn(setSelectedVersions, tag.value);
  }

  function searchByTag(tag: SearchTag) {
    setSelectedProject(null);
    setSelectedUsername(null);
    setSelectedOrganization(null);
    setAppView('discover');
    setMobileFiltersOpen(false);
    setQuery('');
    setSelectedVersions(new Set());
    setSelectedLoaders(
      tag.kind === 'loader' ? new Set([tag.value]) : new Set(),
    );
    setSelectedCategories(
      tag.kind === 'category' ? new Set([tag.value]) : new Set(),
    );
    setPage(1);
    writeProjectListToUrl(projectType);
    window.scrollTo({ top: 0 });
  }

  function openProject(mod: Mod) {
    const next = {
      slug: mod.slug,
      projectType: mod.projectType ?? projectType,
    };

    setSelectedProject(next);
    setSelectedUsername(null);
    setSelectedOrganization(null);
    setAppView('discover');
    setProjectType(next.projectType);
    setMobileFiltersOpen(false);
    writeProjectToUrl(next);
    window.scrollTo({ top: 0 });
  }

  function closeProject() {
    setSelectedProject(null);
    setSelectedUsername(null);
    setSelectedOrganization(null);
    setAppView('discover');
    writeProjectListToUrl(projectType);
    window.scrollTo({ top: 0 });
  }

  function openHome() {
    setSelectedProject(null);
    setSelectedUsername(null);
    setSelectedOrganization(null);
    setAppView('home');
    writeHomeToUrl();
    window.scrollTo({ top: 0 });
  }

  function openDiscover() {
    setSelectedProject(null);
    setSelectedUsername(null);
    setSelectedOrganization(null);
    setAppView('discover');
    setProjectType('mod');
    writeProjectListToUrl('mod');
    window.scrollTo({ top: 0 });
  }

  function openCollections() {
    setSelectedProject(null);
    setSelectedUsername(null);
    setSelectedOrganization(null);
    setAppView('collections');
    writeCollectionsToUrl();
    window.scrollTo({ top: 0 });
  }

  function openDashboard() {
    setSelectedProject(null);
    setSelectedUsername(null);
    setSelectedOrganization(null);
    setAppView('dashboard');
    writeDashboardToUrl();
    window.scrollTo({ top: 0 });
  }

  function openOrganizations() {
    setSelectedProject(null);
    setSelectedUsername(null);
    setSelectedOrganization(null);
    setAppView('organization');
    writeOrganizationsToUrl();
    window.scrollTo({ top: 0 });
  }

  function changeProjectType(nextType: ProjectType) {
    if (nextType === projectType) return;
    setProjectType(nextType);
    setSelectedProject(null);
    setSelectedUsername(null);
    setSelectedOrganization(null);
    setAppView('discover');
    writeProjectListToUrl(nextType);
    setQuery('');
    setSelectedVersions(new Set());
    setSelectedLoaders(new Set());
    setSelectedCategories(new Set());
    setPage(1);
    setMobileFiltersOpen(false);
  }

  const meta = projectTypeMeta(projectType);

  if (appView === 'home' && !selectedProject) {
    return <HomePage onDiscover={openDiscover} />;
  }

  return (
    <div className="min-h-dvh bg-bg">
      <NavBar
        activeType={projectType}
        onTypeChange={changeProjectType}
        onHome={openHome}
        onDiscover={openDiscover}
        onCollections={openCollections}
        onOrganizations={openOrganizations}
        onDashboard={openDashboard}
        isDiscoverActive={appView === 'discover' || Boolean(selectedProject)}
        isCollectionsActive={appView === 'collections'}
        isOrganizationsActive={appView === 'organization'}
        showContentTabs={appView === 'discover' || Boolean(selectedProject)}
        accountSlot={<AuthControls />}
      />

      {selectedProject ? (
        <ProjectPage
          slug={selectedProject.slug}
          projectTypeHint={selectedProject.projectType}
          onBack={closeProject}
          onTagSearch={searchByTag}
        />
      ) : appView === 'collections' ? (
        <CollectionsPage
          onOpenProject={openProject}
          onTagSearch={searchByTag}
        />
      ) : appView === 'dashboard' ? (
        <DashboardPage onOpenProject={openProject} />
      ) : appView === 'organization' ? (
        <OrganizationPage
          slug={selectedOrganization}
          onOpenProject={openProject}
        />
      ) : appView === 'profile' && selectedUsername ? (
        <UserProfilePage
          username={selectedUsername}
          onOpenProject={openProject}
        />
      ) : (
        <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside
              id="filters-panel"
              className={cn('lg:block', mobileFiltersOpen ? 'block' : 'hidden')}
            >
              <FilterSidebar
                tagOptions={tagOptions}
                versionOptions={versionOptions}
                loaderOptions={loaderOptions}
                categoryOptions={categoryOptions}
                selectedTags={selectedTags}
                selectedVersions={selectedVersions}
                selectedLoaders={selectedLoaders}
                selectedCategories={selectedCategories}
                onToggleTag={toggleTag}
                onToggleVersion={(v) => toggleIn(setSelectedVersions, v)}
                onToggleLoader={(v) => toggleIn(setSelectedLoaders, v)}
                onToggleCategory={(v) => toggleIn(setSelectedCategories, v)}
                onClearAll={clearAll}
                hasActiveFilters={hasActiveFilters}
              />
            </aside>

            <section>
              <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4">
                <div className="min-w-[16rem] flex-1">
                  <SearchBar
                    value={query}
                    placeholder={`Search ${meta.plural}...`}
                    ariaLabel={`Search ${meta.plural}`}
                    onChange={(v) => {
                      setQuery(v);
                      setPage(1);
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen((o) => !o)}
                  aria-expanded={mobileFiltersOpen}
                  aria-controls="filters-panel"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover lg:hidden"
                >
                  <Filter className="size-4 text-accent-icon" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="grid size-5 place-items-center rounded-full bg-accent text-xs font-bold text-white tabular-nums">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <SelectField
                  ariaLabel="Sort results"
                  prefix="Sort by:"
                  value={sort}
                  onValueChange={(v) => {
                    setSort(v as SortKey);
                    setPage(1);
                  }}
                  options={SORT_OPTIONS}
                />

                <SelectField
                  ariaLabel="Results per page"
                  prefix="View:"
                  value={view}
                  onValueChange={(v) => {
                    setView(v);
                    setPage(1);
                  }}
                  options={VIEW_OPTIONS}
                />

                <div
                  role="group"
                  aria-label="Layout"
                  className="flex items-center rounded-lg border border-line bg-control p-0.5"
                >
                  <LayoutButton
                    active={layout === 'list'}
                    ariaLabel="List view"
                    onClick={() => setLayout('list')}
                  >
                    <List className="size-4" />
                  </LayoutButton>
                  <LayoutButton
                    active={layout === 'grid'}
                    ariaLabel="Grid view"
                    onClick={() => setLayout('grid')}
                  >
                    <LayoutGrid className="size-4" />
                  </LayoutButton>
                </div>

                <span
                  aria-live="polite"
                  className="ml-auto text-sm font-semibold text-muted tabular-nums"
                >
                  {total.toLocaleString('en-US')}{' '}
                  {total === 1 ? 'result' : 'results'}
                </span>
              </div>

              <div className="mt-5" aria-busy={loading}>
                {error && (
                  <div className="mb-3 rounded-lg bg-accent-soft px-3 py-2 text-sm font-semibold text-ink">
                    The catalog is not responding right now. {error}
                  </div>
                )}

                {loading ? (
                  <ResultsSkeleton layout={layout} count={5} />
                ) : total === 0 ? (
                  <EmptyState onClear={clearAll} itemLabel={meta.plural} />
                ) : (
                  <div
                    className={cn(
                      layout === 'grid'
                        ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'
                        : 'flex flex-col',
                    )}
                  >
                    {mods.map((mod) => (
                      <div
                        key={mod.slug}
                        className={layout === 'grid' ? 'flex' : undefined}
                      >
                        <ModCard
                          mod={mod}
                          layout={layout}
                          onOpen={openProject}
                          onTagSearch={searchByTag}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!loading && total > 0 && totalPages > 1 && (
                <div className="mt-6 flex justify-center sm:justify-end">
                  <Pagination
                    page={safePage}
                    totalPages={totalPages}
                    onPage={setPage}
                  />
                </div>
              )}
            </section>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;

interface SelectedProject {
  slug: string;
  projectType: ProjectType;
}

function projectFromUrl(): SelectedProject | null {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('project');
  const rawType = params.get('type') ?? projectTypeFromPath();
  if (!slug) return null;

  return {
    slug,
    projectType: isProjectType(rawType) ? rawType : 'mod',
  };
}

function viewFromUrl(): AppView {
  if (window.location.pathname === '/dashboard') return 'dashboard';
  if (window.location.pathname === '/collections') return 'collections';
  if (window.location.pathname === '/organizations') return 'organization';
  if (organizationFromUrl()) return 'organization';
  if (profileFromUrl()) return 'profile';
  if (projectTypeFromPath()) return 'discover';

  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'discover' ? 'discover' : 'home';
}

function writeHomeToUrl() {
  const url = new URL(window.location.href);
  url.pathname = '/';
  url.searchParams.delete('project');
  url.searchParams.delete('type');
  url.searchParams.delete('tab');
  url.searchParams.delete('view');

  window.history.pushState(null, '', url);
}

function writeCollectionsToUrl() {
  const url = new URL(window.location.href);
  url.pathname = '/collections';
  url.searchParams.delete('project');
  url.searchParams.delete('type');
  url.searchParams.delete('tab');
  url.searchParams.delete('view');

  window.history.pushState(null, '', url);
}

function writeDashboardToUrl() {
  const url = new URL(window.location.href);
  url.pathname = '/dashboard';
  url.searchParams.delete('project');
  url.searchParams.delete('type');
  url.searchParams.delete('tab');
  url.searchParams.delete('view');

  window.history.pushState(null, '', url);
}

function writeOrganizationsToUrl() {
  const url = new URL(window.location.href);
  url.pathname = '/organizations';
  url.searchParams.delete('project');
  url.searchParams.delete('type');
  url.searchParams.delete('tab');
  url.searchParams.delete('view');

  window.history.pushState(null, '', url);
}

function writeProjectListToUrl(projectType: ProjectType) {
  const url = new URL(window.location.href);
  url.pathname = `/${projectTypeMeta(projectType).path}`;
  url.searchParams.delete('project');
  url.searchParams.delete('type');
  url.searchParams.delete('tab');
  url.searchParams.delete('view');

  window.history.pushState(null, '', url);
}

function profileFromUrl(): string | null {
  const [resource, username] = window.location.pathname
    .split('/')
    .filter(Boolean);
  if (resource !== 'users' || !username) return null;

  return decodeURIComponent(username);
}

function organizationFromUrl(): string | null {
  const [resource, slug] = window.location.pathname.split('/').filter(Boolean);
  if (resource !== 'organizations' || !slug) return null;

  return decodeURIComponent(slug);
}

function writeProjectToUrl(project: SelectedProject | null) {
  const url = new URL(window.location.href);
  if (project) {
    url.pathname = `/${projectTypeMeta(project.projectType).path}`;
    url.searchParams.set('project', project.slug);
    url.searchParams.set('type', project.projectType);
    url.searchParams.delete('view');
  } else {
    url.searchParams.delete('project');
    url.searchParams.delete('type');
    url.searchParams.delete('tab');
  }
  window.history.pushState(null, '', url);
}

function projectTypeFromPath(): ProjectType | null {
  const segment = window.location.pathname.split('/').filter(Boolean)[0];
  const meta = CONTENT_TYPES.find((item) => item.path === segment);

  return meta?.type ?? null;
}

function isProjectType(value: string | null): value is ProjectType {
  return (
    value === 'mod' ||
    value === 'resourcepack' ||
    value === 'datapack' ||
    value === 'shader' ||
    value === 'modpack' ||
    value === 'plugin'
  );
}

function buildOptions(values: string[], selected: Set<string>): FacetOption[] {
  const merged = new Set([...values, ...selected]);
  return [...merged].map((value) => ({ value }));
}

function buildTagOptions({
  categories,
}: {
  categories: string[];
}): TagFacetOption[] {
  return [
    ...unique(categories)
      .filter(isProjectCategoryTag)
      .map((value): TagFacetOption => ({ kind: 'category', value })),
  ];
}

function selectedCategoriesToTags(selected: Set<string>): string[] {
  return [...selected].map((value) => `category:${value}`);
}

function selectedLoadersToTags(selected: Set<string>): string[] {
  return [...selected].map((value) => `loader:${value}`);
}

function selectedVersionsToTags(selected: Set<string>): string[] {
  return [...selected].map((value) => `version:${value}`);
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function LayoutButton({
  active,
  ariaLabel,
  onClick,
  children,
}: {
  active: boolean;
  ariaLabel: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'relative grid size-9 place-items-center rounded-md transition-colors',
        active ? 'text-accent-icon' : 'text-faint hover:text-accent-icon',
      )}
    >
      {active && (
        <motion.span
          layoutId="layoutToggleIndicator"
          className="absolute inset-0 rounded-md bg-control-hover"
          transition={{ type: 'spring', stiffness: 520, damping: 40 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
