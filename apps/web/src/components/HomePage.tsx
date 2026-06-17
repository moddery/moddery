import { useQuery } from '@tanstack/react-query';
import { ModderyMark } from './icons.tsx';
import { AuthControls } from './AuthControls.tsx';
import {
  fetchPublicCollections,
  searchProjects,
  type PublicCollection,
  type SortKey,
} from '../lib/catalog.ts';
import { type Mod, type ProjectType } from '../types.ts';
import { type SearchTag } from './ModCard.tsx';
import { HomeCollectionSection } from './home/HomeCollectionSection.tsx';
import { HomeProjectSection } from './home/HomeProjectSection.tsx';

export function HomePage({
  onDiscover,
  onOpenCollection,
  onOpenProject,
  onTagSearch,
}: {
  onDiscover: () => void;
  onOpenCollection?: (collection: PublicCollection) => void;
  onOpenProject: (mod: Mod) => void;
  onTagSearch: (tag: SearchTag) => void;
}) {
  const popularModsQuery = useHomeProjects('mod', 'downloads');
  const popularPluginsQuery = useHomeProjects('plugin', 'downloads');
  const updatedModpacksQuery = useHomeProjects('modpack', 'updated');
  const collectionsQuery = useQuery({
    queryFn: ({ signal }) => fetchPublicCollections(signal),
    queryKey: ['home', 'collections'],
  });

  const popularMods = popularModsQuery.data?.projects ?? [];
  const popularPlugins = popularPluginsQuery.data?.projects ?? [];
  const updatedModpacks = updatedModpacksQuery.data?.projects ?? [];
  const collections = collectionsQuery.data?.slice(0, 3) ?? [];

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center gap-4 px-4 sm:px-6">
          <a href="/" className="flex shrink-0 items-center gap-2.5">
            <ModderyMark className="size-8 text-accent-icon" />
            <span className="font-display text-xl font-extrabold lowercase text-ink">
              moddery
            </span>
          </a>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onDiscover}
              className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
            >
              Explore
            </button>
            <AuthControls />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 sm:px-6">
        <section className="grid min-h-[54dvh] content-center border-b border-line py-14">
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
            An open home for{' '}
            <span className="text-accent-icon">Minecraft projects</span>.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            Publish, discover, and preserve mods, plugins, and packs — fast,
            independent, and built to stay open.
          </p>
          <div className="mt-7">
            <button
              type="button"
              onClick={onDiscover}
              className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
            >
              Explore projects
            </button>
          </div>
        </section>

        <div className="grid gap-10 pt-8">
          <HomeProjectSection
            title="Popular mods"
            subtitle="The projects players are downloading most."
            projects={popularMods}
            loading={popularModsQuery.isLoading}
            onOpenProject={onOpenProject}
            onTagSearch={onTagSearch}
          />
          <HomeProjectSection
            title="Popular plugins"
            subtitle="Server tools and extensions with strong adoption."
            projects={popularPlugins}
            loading={popularPluginsQuery.isLoading}
            onOpenProject={onOpenProject}
            onTagSearch={onTagSearch}
          />
          <HomeProjectSection
            title="Recently updated modpacks"
            subtitle="Fresh pack updates from creators."
            projects={updatedModpacks}
            loading={updatedModpacksQuery.isLoading}
            onOpenProject={onOpenProject}
            onTagSearch={onTagSearch}
          />
          <HomeCollectionSection
            collections={collections}
            loading={collectionsQuery.isLoading}
            onOpenCollection={onOpenCollection}
            onOpenProject={onOpenProject}
            onTagSearch={onTagSearch}
          />
        </div>
      </main>
    </div>
  );
}

function useHomeProjects(projectType: ProjectType, sort: SortKey) {
  return useQuery({
    queryFn: ({ signal }) =>
      searchProjects({
        categories: [],
        limit: 4,
        loaders: [],
        page: 1,
        projectType,
        query: '',
        signal,
        sort,
        versions: [],
      }),
    queryKey: ['home', 'projects', projectType, sort],
  });
}
