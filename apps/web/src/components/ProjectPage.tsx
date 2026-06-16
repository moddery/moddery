import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ReportReason } from '@moddery/shared';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, {
  defaultSchema,
  type Options as RehypeSanitizeOptions,
} from 'rehype-sanitize';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import type { ProjectType } from '../types.ts';
import type { SearchTag } from './ModCard.tsx';
import {
  fetchProjectDetails,
  fetchProjectMembers,
  fetchProjectVersions,
  fetchViewerProjectFollowState,
  createProjectReport,
  fetchProjectAnalytics,
  hasAuthToken,
  setProjectFollowing,
  type ProjectDetails,
  type ProjectAnalytics,
  type ProjectFollowState,
  type ProjectGalleryImage,
  type ProjectMember,
  type ProjectVersion,
} from '../lib/catalog.ts';
import { projectTypeMeta } from '../lib/projectTypes.ts';
import { cn } from '../lib/cn.ts';
import {
  formatBytes,
  formatCount,
  formatDate,
  timeAgo,
  compareVersions,
} from '../lib/format.ts';
import {
  ChevronLeft,
  Clock,
  Download,
  ExternalLink as ExternalLinkIcon,
  Heart,
  Flag,
  UserRound,
} from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import { CategoryTag, Chip, LoaderTag } from './Chips.tsx';
import { SelectField, type SelectOption } from './ui/Select.tsx';

const allowedEmbedSrc =
  /^https:\/\/(?:(?:www\.)?youtube\.com\/embed\/|www\.youtube-nocookie\.com\/embed\/|discord\.com\/widget|ptb\.discord\.com\/widget|canary\.discord\.com\/widget)/;

const projectMarkdownSchema: RehypeSanitizeOptions = {
  ...defaultSchema,
  tagNames: [
    ...new Set([...(defaultSchema.tagNames ?? []), 'area', 'iframe', 'map']),
  ],
  attributes: {
    ...defaultSchema.attributes,
    area: ['alt', 'coords', 'href', 'shape', 'target'],
    iframe: [
      ['src', allowedEmbedSrc],
      'allow',
      'allowFullScreen',
      'frameBorder',
      'height',
      'loading',
      'referrerPolicy',
      'title',
      'width',
    ],
    img: [...(defaultSchema.attributes?.img ?? []), 'sizes', 'srcSet'],
    map: ['name'],
    source: [
      ...(defaultSchema.attributes?.source ?? []),
      'media',
      'sizes',
      'type',
    ],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'irc', 'ircs', 'mailto', 'xmpp'],
    src: ['http', 'https'],
    srcSet: ['http', 'https'],
  },
};

type ProjectTab = 'description' | 'gallery' | 'changelog' | 'versions';

const defaultProjectTab: ProjectTab = 'description';
const allVersionFilter = '__all_versions__';
const allLoaderFilter = '__all_loaders__';
const preferredLoaderOrder = [
  'fabric',
  'neoforge',
  'forge',
  'quilt',
  'babric',
  'paper',
  'spigot',
  'bukkit',
  'iris',
  'optifine',
];
const projectTabs: Array<{ id: ProjectTab; label: string }> = [
  { id: 'description', label: 'Description' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'changelog', label: 'Changelog' },
  { id: 'versions', label: 'Versions' },
];

const reportReasons: Array<{ label: string; value: ReportReason }> = [
  { label: 'Broken or misleading', value: 'BROKEN_OR_MISLEADING' },
  { label: 'Malware', value: 'MALWARE' },
  { label: 'Copyright', value: 'COPYRIGHT' },
  { label: 'Spam', value: 'SPAM' },
  { label: 'Impersonation', value: 'IMPERSONATION' },
  { label: 'Hateful or abusive', value: 'HATEFUL_OR_ABUSIVE' },
  { label: 'Other', value: 'OTHER' },
];

function readProjectTab(): ProjectTab {
  const tab = new URLSearchParams(window.location.search).get('tab');
  return projectTabs.some((item) => item.id === tab)
    ? (tab as ProjectTab)
    : defaultProjectTab;
}

interface ProjectPageProps {
  slug: string;
  projectTypeHint: ProjectType;
  onBack: () => void;
  onTagSearch?: (tag: SearchTag) => void;
}

export function ProjectPage({
  slug,
  projectTypeHint,
  onBack,
  onTagSearch,
}: ProjectPageProps) {
  const [activeTab, setActiveTab] = useState<ProjectTab>(readProjectTab);
  const projectQuery = useQuery({
    queryFn: async ({ signal }) => {
      const [project, versions, members, followState, analytics] =
        await Promise.all([
          fetchProjectDetails(slug, signal),
          fetchProjectVersions(slug, signal),
          fetchProjectMembers(slug, signal),
          fetchViewerProjectFollowState(slug, signal),
          fetchProjectAnalytics(slug, signal),
        ]);

      return { analytics, followState, members, project, versions };
    },
    queryKey: ['catalog', 'project', slug],
  });

  useEffect(() => {
    const handlePopState = () => setActiveTab(readProjectTab());

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [slug]);

  function selectTab(tab: ProjectTab) {
    setActiveTab(tab);

    const url = new URL(window.location.href);
    if (tab === defaultProjectTab) {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', tab);
    }

    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  if (projectQuery.isLoading) return <ProjectPageSkeleton onBack={onBack} />;

  const project = projectQuery.data?.project;
  const versions = projectQuery.data?.versions ?? [];
  const members = projectQuery.data?.members ?? [];
  const followState = projectQuery.data?.followState ?? null;
  const analytics = projectQuery.data?.analytics ?? null;
  const error =
    projectQuery.error instanceof Error ? projectQuery.error.message : null;

  if (error || !project) {
    return (
      <section className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
        <BackButton onBack={onBack} />
        <div className="mt-5 py-8">
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Project not found
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            {error ?? 'The catalog did not return a project for this page.'}
          </p>
        </div>
      </section>
    );
  }

  const latestVersion = versions[0];
  const latestFile =
    latestVersion?.files.find((file) => file.primary) ??
    latestVersion?.files[0];
  const projectType = project.project_type ?? projectTypeHint;
  const meta = projectTypeMeta(projectType);
  const supportedVersions = [...project.game_versions]
    .sort((a, b) => compareVersions(b, a))
    .slice(0, 14);
  const categories = [...project.categories, ...project.additional_categories];
  const gallery = [...(project.gallery ?? [])].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.ordering - b.ordering;
  });
  const changelogVersions = versions.filter((version) =>
    version.changelog?.trim(),
  );
  const showProjectSidebar = activeTab === 'description';

  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <BackButton onBack={onBack} />

      <header className="mt-5 pb-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {project.icon_url ? (
            <img
              src={project.icon_url}
              alt={`${project.title} icon`}
              width={96}
              height={96}
              className="size-20 rounded-md bg-surface-2 object-cover sm:size-24"
            />
          ) : (
            <div
              aria-hidden="true"
              className="size-20 rounded-md bg-surface-2 sm:size-24"
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="font-display text-3xl font-extrabold leading-tight text-ink">
                {project.title}
              </h1>
              {project.author && (
                <span className="text-sm font-medium text-muted">
                  by {project.author}
                </span>
              )}
            </div>

            <p className="mt-3 max-w-3xl text-pretty text-base leading-7 text-muted">
              {project.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {project.loaders.map((loader) => (
                <LoaderTag
                  key={loader}
                  loader={loader}
                  onClick={
                    onTagSearch === undefined
                      ? undefined
                      : () => onTagSearch({ kind: 'loader', value: loader })
                  }
                />
              ))}
              {categories.slice(0, 6).map((category) => (
                <CategoryTag
                  key={category}
                  category={category}
                  onClick={
                    onTagSearch === undefined
                      ? undefined
                      : () => onTagSearch({ kind: 'category', value: category })
                  }
                />
              ))}
              <Chip>{meta.label}</Chip>
            </div>
          </div>
        </div>
      </header>

      <div
        className={cn(
          'mt-6 grid gap-8',
          showProjectSidebar && 'lg:grid-cols-[minmax(0,1fr)_300px]',
        )}
      >
        <main className="min-w-0">
          <ProjectTabs
            activeTab={activeTab}
            galleryCount={gallery.length}
            versionCount={versions.length}
            changelogCount={changelogVersions.length}
            onSelect={selectTab}
          />

          <div className="pt-6">
            {activeTab === 'description' && (
              <section aria-label="Description">
                <ProjectMarkdown body={project.body || project.description} />
              </section>
            )}

            {activeTab === 'gallery' && <GalleryTab images={gallery} />}

            {activeTab === 'changelog' && (
              <ChangelogTab versions={changelogVersions} />
            )}

            {activeTab === 'versions' && <VersionsTab versions={versions} />}
          </div>
        </main>

        {showProjectSidebar && (
          <aside className="lg:sticky lg:top-32 lg:self-start">
            {latestFile && (
              <a
                href={latestFile.url}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 text-sm font-bold text-white no-underline transition-colors hover:bg-accent-strong"
              >
                <Download className="size-4" />
                Download latest
              </a>
            )}
            <FollowProjectButton project={project} initialState={followState} />

            <div className="mt-4 divide-y divide-line/70">
              <MetaRow
                icon={<Download className="size-4 text-accent-icon" />}
                label="Downloads"
                value={formatCount(project.downloads, 2)}
              />
              <MetaRow
                icon={<Heart className="size-4 text-accent-icon" />}
                label="Followers"
                value={formatCount(project.followers, 1)}
              />
              <MetaRow
                icon={<Clock className="size-4 text-accent-icon" />}
                label="Updated"
                value={timeAgo(project.updated)}
              />
              <MetaRow
                label="Published"
                value={formatDate(project.published)}
              />
              <MetaRow label="License" value={project.license.id} />
              {latestFile && (
                <MetaRow
                  label="Latest file"
                  value={formatBytes(latestFile.size)}
                />
              )}
            </div>

            {analytics && <ProjectAnalyticsSection analytics={analytics} />}

            <section className="mt-6">
              <h2 className="font-display text-base font-extrabold text-ink">
                Links
              </h2>
              <div className="mt-3 flex flex-col gap-1">
                <ExternalLink href={project.source_url}>Source</ExternalLink>
                <ExternalLink href={project.issues_url}>Issues</ExternalLink>
                <ExternalLink href={project.wiki_url}>Wiki</ExternalLink>
                <ExternalLink href={project.discord_url}>Discord</ExternalLink>
                {project.donation_urls.map((link) => (
                  <ExternalLink key={link.id} href={link.url}>
                    {link.platform}
                  </ExternalLink>
                ))}
              </div>
            </section>

            {members.length > 0 && <ProjectMembersSection members={members} />}

            <ProjectReportSection project={project} />

            {supportedVersions.length > 0 && (
              <section className="mt-6">
                <h2 className="font-display text-base font-extrabold text-ink">
                  Supported Versions
                </h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {supportedVersions.map((version) => (
                    <Chip key={version}>{version}</Chip>
                  ))}
                </div>
              </section>
            )}
          </aside>
        )}
      </div>
    </section>
  );
}

function ProjectTabs({
  activeTab,
  galleryCount,
  changelogCount,
  versionCount,
  onSelect,
}: {
  activeTab: ProjectTab;
  galleryCount: number;
  changelogCount: number;
  versionCount: number;
  onSelect: (tab: ProjectTab) => void;
}) {
  const counts: Partial<Record<ProjectTab, number>> = {
    gallery: galleryCount,
    changelog: changelogCount,
    versions: versionCount,
  };

  return (
    <div
      role="tablist"
      aria-label="Project sections"
      className="flex gap-6 overflow-x-auto border-b border-line scrollbar-none"
    >
      {projectTabs.map((tab) => {
        const selected = activeTab === tab.id;
        const count = counts[tab.id];

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(tab.id)}
            className={cn(
              'relative flex h-11 items-center gap-2 whitespace-nowrap px-0.5 text-sm font-extrabold transition-colors',
              selected ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {tab.label}
            {typeof count === 'number' && count > 0 && (
              <span
                className={cn(
                  'text-xs font-extrabold tabular-nums',
                  selected ? 'text-accent-icon' : 'text-muted',
                )}
              >
                {count.toLocaleString('en-US')}
              </span>
            )}
            {selected && (
              <motion.span
                layoutId="projectTabUnderline"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent"
                transition={{ type: 'spring', stiffness: 480, damping: 38 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function GalleryTab({ images }: { images: ProjectGalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState(-1);

  if (!images.length) {
    return (
      <EmptyTab
        title="No gallery yet"
        body="This project has not added screenshots or preview media."
      />
    );
  }

  const slides = images.map((image) => ({
    src: image.raw_url || image.url,
    alt: image.title ?? 'Project gallery image',
    title: image.title ?? undefined,
    description: image.description ?? undefined,
  }));

  return (
    <section aria-label="Gallery" className="grid gap-6 md:grid-cols-2">
      {images.map((image, index) => (
        <figure
          key={`${image.url}-${image.created}`}
          className={cn(
            index === 0 && images.length > 2 ? 'md:col-span-2' : '',
          )}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`Open ${image.title ?? 'gallery image'} in viewer`}
            className="block w-full overflow-hidden rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:opacity-90"
          >
            <img
              src={image.url || image.raw_url}
              alt={image.title ?? 'Project gallery image'}
              loading="lazy"
              className="aspect-video w-full bg-surface-2 object-cover"
            />
          </button>
          {(image.title || image.description) && (
            <figcaption className="mt-2 text-sm leading-6 text-ink">
              {image.title && (
                <strong className="font-extrabold">{image.title}</strong>
              )}
              {image.description && (
                <p className="mt-0.5 text-sm leading-6 text-muted">
                  {image.description}
                </p>
              )}
            </figcaption>
          )}
        </figure>
      ))}

      <Lightbox
        open={openIndex >= 0}
        index={openIndex}
        close={() => setOpenIndex(-1)}
        slides={slides}
        plugins={[Captions, Counter, Thumbnails, Zoom]}
        captions={{ descriptionTextAlign: 'center' }}
        counter={{ container: { style: { top: 0, left: 0 } } }}
        styles={{
          root: {
            '--yarl__color_backdrop': 'rgba(0, 0, 0, 0.92)',
            '--yarl__slide_captions_container_background': 'transparent',
          },
        }}
      />
    </section>
  );
}

function ChangelogTab({ versions }: { versions: ProjectVersion[] }) {
  if (!versions.length) {
    return (
      <EmptyTab
        title="No changelog yet"
        body="This project does not have changelog notes yet."
      />
    );
  }

  return (
    <section aria-label="Changelog">
      {versions.map((version) => (
        <article key={version.id} className="border-b border-line py-5">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h2 className="font-display text-lg font-extrabold text-ink">
              {version.name}
            </h2>
            <span className="text-sm font-bold text-muted">
              {version.version_number}
            </span>
            <span className="text-xs font-bold uppercase text-accent-icon">
              {version.version_type}
            </span>
            <span className="text-sm font-semibold text-muted">
              {timeAgo(version.date_published)}
            </span>
          </div>
          <ProjectMarkdown body={version.changelog ?? ''} />
        </article>
      ))}
    </section>
  );
}

function VersionsTab({ versions }: { versions: ProjectVersion[] }) {
  const [gameVersion, setGameVersion] = useState(allVersionFilter);
  const [loader, setLoader] = useState(allLoaderFilter);
  const gameVersionOptions = useMemo(
    () => buildGameVersionOptions(versions),
    [versions],
  );
  const loaderOptions = useMemo(() => buildLoaderOptions(versions), [versions]);
  const filteredVersions = useMemo(
    () => filterProjectVersions(versions, gameVersion, loader),
    [versions, gameVersion, loader],
  );

  useEffect(() => {
    if (
      gameVersion !== allVersionFilter &&
      !gameVersionOptions.some((option) => option.value === gameVersion)
    ) {
      setGameVersion(allVersionFilter);
    }

    if (
      loader !== allLoaderFilter &&
      !loaderOptions.some((option) => option.value === loader)
    ) {
      setLoader(allLoaderFilter);
    }
  }, [gameVersion, gameVersionOptions, loader, loaderOptions]);

  if (!versions.length) {
    return (
      <EmptyTab
        title="No versions yet"
        body="This project does not have published files yet."
      />
    );
  }

  return (
    <section aria-label="Versions">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <span className="text-sm font-semibold text-muted">
          {filteredVersions.length.toLocaleString('en-US')} of{' '}
          {versions.length.toLocaleString('en-US')} versions
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <SelectField
            ariaLabel="Filter by game version"
            prefix="Version:"
            value={gameVersion}
            onValueChange={setGameVersion}
            options={gameVersionOptions}
            align="end"
            className="h-9"
          />
          <SelectField
            ariaLabel="Filter by loader"
            prefix="Loader:"
            value={loader}
            onValueChange={setLoader}
            options={loaderOptions}
            align="end"
            className="h-9"
          />
        </div>
      </div>

      {filteredVersions.length ? (
        <div>
          {filteredVersions.map((version) => (
            <VersionRow key={version.id} version={version} />
          ))}
        </div>
      ) : (
        <EmptyTab
          title="No matching versions"
          body="There are no files for that version and loader combination."
        />
      )}
    </section>
  );
}

function EmptyTab({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-8">
      <h2 className="font-display text-lg font-extrabold text-ink">{title}</h2>
      <p className="mt-1 max-w-xl text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}

function buildGameVersionOptions(versions: ProjectVersion[]): SelectOption[] {
  const gameVersions = new Set(
    versions.flatMap((version) => version.game_versions),
  );

  return [
    { label: 'All versions', value: allVersionFilter },
    ...[...gameVersions]
      .sort((a, b) => compareVersions(b, a))
      .map((version) => ({ label: version, value: version })),
  ];
}

function buildLoaderOptions(versions: ProjectVersion[]): SelectOption[] {
  const loaders = new Set(versions.flatMap((version) => version.loaders));

  return [
    { label: 'All loaders', value: allLoaderFilter },
    ...[...loaders]
      .sort((a, b) => {
        const aIndex = preferredLoaderOrder.indexOf(a);
        const bIndex = preferredLoaderOrder.indexOf(b);

        if (aIndex !== -1 || bIndex !== -1) {
          return (
            (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
          );
        }

        return a.localeCompare(b);
      })
      .map((loader) => ({ label: formatLoaderLabel(loader), value: loader })),
  ];
}

function filterProjectVersions(
  versions: ProjectVersion[],
  gameVersion: string,
  loader: string,
): ProjectVersion[] {
  return versions
    .filter((version) => {
      const matchesGameVersion =
        gameVersion === allVersionFilter ||
        version.game_versions.includes(gameVersion);
      const matchesLoader =
        loader === allLoaderFilter || version.loaders.includes(loader);

      return matchesGameVersion && matchesLoader;
    })
    .sort(
      (a, b) => Date.parse(b.date_published) - Date.parse(a.date_published),
    );
}

function formatLoaderLabel(loader: string): string {
  const labels: Record<string, string> = {
    babric: 'Babric',
    bukkit: 'Bukkit',
    fabric: 'Fabric',
    forge: 'Forge',
    iris: 'Iris',
    neoforge: 'NeoForge',
    optifine: 'OptiFine',
    paper: 'Paper',
    quilt: 'Quilt',
    spigot: 'Spigot',
  };

  return labels[loader] ?? loader;
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex h-9 items-center gap-2 rounded-lg bg-control px-3 text-sm font-bold text-ink transition-colors hover:bg-control-hover"
    >
      <ChevronLeft className="size-4 text-accent-icon" />
      Back to results
    </button>
  );
}

function MetaRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 text-sm">
      <span className="inline-flex items-center gap-2 font-semibold text-muted">
        {icon}
        {label}
      </span>
      <span className="min-w-0 truncate text-right font-bold text-ink">
        {value}
      </span>
    </div>
  );
}

function ProjectAnalyticsSection({
  analytics,
}: {
  analytics: ProjectAnalytics;
}) {
  const maxViews = Math.max(1, ...analytics.days.map((day) => day.views));
  const maxDownloads = Math.max(
    1,
    ...analytics.days.map((day) => day.downloads),
  );

  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-extrabold text-ink">
        Analytics
      </h2>
      <div className="mt-3 divide-y divide-line/70">
        <MetaRow
          label="Views, 30 days"
          value={formatCount(analytics.viewsLast30Days, 1)}
        />
        <MetaRow
          label="Downloads, 30 days"
          value={formatCount(analytics.downloadsLast30Days, 1)}
        />
      </div>
      <div className="mt-4 grid grid-cols-[repeat(14,minmax(0,1fr))] items-end gap-1">
        {analytics.days.slice(-14).map((day) => (
          <div key={day.date} className="flex h-16 items-end gap-0.5">
            <span
              title={`${day.views.toLocaleString('en-US')} views`}
              className="w-full rounded-t-sm bg-accent-soft"
              style={{
                height: `${Math.max(8, (day.views / maxViews) * 64).toString()}px`,
              }}
            />
            <span
              title={`${day.downloads.toLocaleString('en-US')} downloads`}
              className="w-full rounded-t-sm bg-accent"
              style={{
                height: `${Math.max(8, (day.downloads / maxDownloads) * 64).toString()}px`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-muted">
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-sm bg-accent-soft" />
          Views
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-sm bg-accent" />
          Downloads
        </span>
      </div>
    </section>
  );
}

function ProjectMembersSection({ members }: { members: ProjectMember[] }) {
  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-extrabold text-ink">
        Creators
      </h2>
      <div className="mt-3 flex flex-col gap-2">
        {members.map((member) => {
          const name = member.user.display_name ?? member.user.username;

          return (
            <div
              key={member.user.id}
              className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5"
            >
              {member.user.avatar_url ? (
                <img
                  src={member.user.avatar_url}
                  alt=""
                  className="size-8 rounded-md bg-surface-2 object-cover"
                />
              ) : (
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-2 text-accent-icon">
                  <UserRound className="size-4" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink">
                  {name}
                </span>
                <span className="block truncate text-xs font-semibold text-muted">
                  {member.owner ? 'Owner' : member.role}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FollowProjectButton({
  project,
  initialState,
}: {
  project: ProjectDetails;
  initialState: ProjectFollowState | null;
}) {
  const [state, setState] = useState<ProjectFollowState | null>(initialState);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const following = state?.following ?? false;
  const followers = state?.followers ?? project.followers;

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  async function toggleFollow() {
    if (!hasAuthToken()) {
      setMessage('Sign in to follow projects.');
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      setState(await setProjectFollowing(project.slug, !following));
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Could not update follow.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void toggleFollow()}
        className={cn(
          'inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
          following
            ? 'bg-accent-selected text-ink hover:bg-control-hover'
            : 'bg-control text-ink hover:bg-control-hover',
        )}
      >
        <Heart className="size-4 text-accent-icon" />
        {following ? 'Following' : 'Follow'}
        <span className="text-muted tabular-nums">
          {formatCount(followers, 1)}
        </span>
      </button>
      {message && (
        <p className="mt-2 text-xs font-semibold text-muted">{message}</p>
      )}
    </div>
  );
}

function ProjectReportSection({ project }: { project: ProjectDetails }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('BROKEN_OR_MISLEADING');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasAuthToken()) {
      setMessage('Sign in to report a project.');
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      await createProjectReport({
        body,
        projectSlug: project.slug,
        reason,
      });
      setBody('');
      setMessage('Report submitted.');
      setOpen(false);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Report failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-control px-3 text-sm font-bold text-ink transition-colors hover:bg-control-hover"
      >
        <Flag className="size-4 text-accent-icon" />
        Report project
      </button>

      {open && (
        <form onSubmit={(event) => void submitReport(event)} className="mt-3">
          <label className="block text-xs font-bold uppercase text-muted">
            Reason
            <select
              value={reason}
              onChange={(event) =>
                setReason(event.target.value as ReportReason)
              }
              className="mt-1 h-9 w-full rounded-md border border-line bg-control px-2 text-sm normal-case text-ink outline-none focus-visible:border-accent"
            >
              {reportReasons.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-xs font-bold uppercase text-muted">
            Details
            <textarea
              required
              minLength={8}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="mt-1 min-h-24 w-full resize-y rounded-md border border-line bg-control px-2 py-2 text-sm normal-case text-ink outline-none placeholder:text-faint focus-visible:border-accent"
              placeholder="What should moderators know?"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="mt-2 inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            Submit report
          </button>
        </form>
      )}

      {message && (
        <p className="mt-2 text-xs font-semibold text-muted">{message}</p>
      )}
    </section>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string | null;
  children: ReactNode;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm font-semibold text-muted no-underline transition-colors hover:bg-control-hover hover:text-ink"
    >
      {children}
      <ExternalLinkIcon className="size-3.5 text-accent-icon" />
    </a>
  );
}

function VersionRow({ version }: { version: ProjectVersion }) {
  const primaryFile =
    version.files.find((file) => file.primary) ?? version.files[0];
  const typeClass = {
    release: 'text-ink',
    beta: 'text-accent-icon',
    alpha: 'text-faint',
  }[version.version_type];

  return (
    <div className="grid gap-3 border-b border-line py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="truncate font-display text-base font-extrabold text-ink">
            {version.name}
          </h3>
          <span className="text-sm font-bold text-muted">
            {version.version_number}
          </span>
          <span className={cn('text-xs font-bold uppercase', typeClass)}>
            {version.version_type}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {version.loaders.slice(0, 3).map((loader) => (
            <LoaderTag key={loader} loader={loader} />
          ))}
          {version.game_versions.slice(0, 4).map((gameVersion) => (
            <Chip key={gameVersion}>{gameVersion}</Chip>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm sm:justify-end">
        <span className="hidden font-semibold text-muted sm:inline">
          {timeAgo(version.date_published)}
        </span>
        <span className="inline-flex items-center gap-1.5 font-bold text-ink tabular-nums">
          <Download className="size-4 text-accent-icon" />
          {formatCount(version.downloads, 1)}
        </span>
        {primaryFile && (
          <a
            href={primaryFile.url}
            className="grid size-9 place-items-center rounded-lg bg-control text-accent-icon transition-colors hover:bg-control-hover"
            aria-label={`Download ${version.name}`}
          >
            <Download className="size-4" />
          </a>
        )}
      </div>
    </div>
  );
}

function ProjectMarkdown({ body }: { body: string }) {
  return (
    <div className="project-markdown mt-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, projectMarkdownSchema]]}
        components={{
          a: ({ children, href }) => {
            const isExternal = Boolean(href && /^https?:\/\//i.test(href));

            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noreferrer' : undefined}
              >
                {children}
              </a>
            );
          },
          img: ({ alt, src }) => (
            <img src={src} alt={alt ?? ''} loading="lazy" decoding="async" />
          ),
          input: (props) => <input {...props} readOnly />,
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}

function ProjectPageSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <BackButton onBack={onBack} />
      <div className="mt-5 pb-2">
        <div className="flex gap-4">
          <div className="size-20 rounded-md bg-surface-2 sm:size-24" />
          <div className="flex-1">
            <div className="h-8 max-w-sm rounded-md bg-surface-2" />
            <div className="mt-3 h-4 max-w-2xl rounded-sm bg-surface-2" />
            <div className="mt-2 h-4 max-w-xl rounded-sm bg-surface-2" />
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-3">
          <div className="h-5 w-24 rounded-sm bg-surface-2" />
          <div className="h-4 rounded-sm bg-surface-2" />
          <div className="h-4 max-w-3xl rounded-sm bg-surface-2" />
          <div className="h-4 max-w-2xl rounded-sm bg-surface-2" />
        </div>
        <div className="hidden space-y-3 lg:block">
          <div className="h-10 rounded-lg bg-surface-2" />
          <div className="h-28 rounded-lg bg-surface-2" />
        </div>
      </div>
    </section>
  );
}
