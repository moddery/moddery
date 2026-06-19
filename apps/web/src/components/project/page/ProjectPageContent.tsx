import { cn } from '../../../lib/cn.ts';
import {
  type ProjectAnalytics,
  type ProjectDetails,
  type ProjectFollowState,
  type ProjectGalleryImage,
  type ProjectMember,
  type ProjectVersion,
  type ProjectFile,
} from '../../../lib/catalog.ts';
import {
  ChangelogTab,
  GalleryTab,
  ProjectMarkdown,
  ProjectTabs,
  type ProjectTab,
  VersionsTab,
} from '../ProjectContentTabs.tsx';
import { ProjectSidebar } from '../ProjectSidebar.tsx';
import { type SearchTag } from '../../ModCard.tsx';

export function ProjectPageContent({
  activeTab,
  analytics,
  changelogVersions,
  followState,
  gallery,
  latestFile,
  latestVersion,
  members,
  onDownloadLatest,
  onFollowChanged,
  onRequestAuth,
  onSelectTab,
  onSelectVersion,
  onTagSearch,
  project,
  selectedVersion,
  supportedVersions,
  versions,
}: {
  activeTab: ProjectTab;
  analytics: ProjectAnalytics | null;
  changelogVersions: ProjectVersion[];
  followState: ProjectFollowState | null;
  gallery: ProjectGalleryImage[];
  latestFile: ProjectFile | undefined;
  latestVersion: ProjectVersion | undefined;
  members: ProjectMember[];
  onDownloadLatest: () => void;
  onFollowChanged: (state: ProjectFollowState) => void;
  onRequestAuth?: () => void;
  onSelectTab: (tab: ProjectTab) => void;
  onSelectVersion: (versionNumber: string | null) => void;
  onTagSearch?: (tag: SearchTag) => void;
  project: ProjectDetails;
  selectedVersion: string | null;
  supportedVersions: string[];
  versions: ProjectVersion[];
}) {
  const showProjectSidebar = activeTab === 'description';

  return (
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
          onSelect={onSelectTab}
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

          {activeTab === 'versions' && (
            <VersionsTab
              onRequestAuth={onRequestAuth}
              projectSlug={project.slug}
              projectType={project.projectType}
              selectedVersion={selectedVersion}
              versions={versions}
              onSelectVersion={onSelectVersion}
              onTagSearch={onTagSearch}
            />
          )}
        </div>
      </main>

      {showProjectSidebar && (
        <ProjectSidebar
          analytics={analytics}
          followState={followState}
          latestFile={latestFile}
          latestVersion={latestVersion}
          members={members}
          onDownloadLatest={onDownloadLatest}
          onFollowChanged={onFollowChanged}
          onRequestAuth={onRequestAuth}
          onSelectVersion={onSelectVersion}
          onTagSearch={onTagSearch}
          project={project}
          supportedVersions={supportedVersions}
        />
      )}
    </div>
  );
}
