import { Clock, Download, Heart } from 'lucide-react';

import {
  type ProjectAnalytics,
  type ProjectDetails,
  type ProjectFollowState,
  type ProjectMember,
  type ProjectVersion,
} from '../../lib/catalog.ts';
import {
  formatBytes,
  formatCount,
  formatDate,
  timeAgo,
} from '../../lib/format.ts';
import { CopyLinkButton } from '../CopyLinkButton.tsx';
import { type SearchTag } from '../ModCard.tsx';
import { FollowProjectButton } from './sidebar/FollowProjectButton.tsx';
import { LatestVersionSection } from './sidebar/LatestVersionSection.tsx';
import { MetaRow } from './sidebar/MetaRow.tsx';
import { ProjectAnalyticsSection } from './sidebar/ProjectAnalyticsSection.tsx';
import { ProjectCategoriesSection } from './sidebar/ProjectCategoriesSection.tsx';
import { ProjectCollectionSave } from './sidebar/ProjectCollectionSave.tsx';
import { ProjectLifecycleSection } from './sidebar/ProjectLifecycleSection.tsx';
import { ProjectLicenseSection } from './sidebar/ProjectLicenseSection.tsx';
import { ProjectLinksSection } from './sidebar/ProjectLinksSection.tsx';
import { ProjectMembersSection } from './sidebar/ProjectMembersSection.tsx';
import { ProjectModerationNotes } from './sidebar/ProjectModerationNotes.tsx';
import { ProjectOwnershipSection } from './sidebar/ProjectOwnershipSection.tsx';
import { ProjectReportSection } from './sidebar/ProjectReportSection.tsx';
import { SupportedVersionsSection } from './sidebar/SupportedVersionsSection.tsx';

export function ProjectSidebar({
  analytics,
  followState,
  latestFile,
  latestVersion,
  members,
  onDownloadLatest,
  onFollowChanged,
  onSelectVersion,
  onTagSearch,
  project,
  supportedVersions,
}: {
  analytics: ProjectAnalytics | null;
  followState: ProjectFollowState | null;
  latestFile: ProjectVersion['files'][number] | undefined;
  latestVersion: ProjectVersion | undefined;
  members: ProjectMember[];
  onDownloadLatest: () => void;
  onFollowChanged: (state: ProjectFollowState) => void;
  onSelectVersion: (versionNumber: string | null) => void;
  onTagSearch?: (tag: SearchTag) => void;
  project: ProjectDetails;
  supportedVersions: string[];
}) {
  return (
    <aside className="lg:sticky lg:top-32 lg:self-start">
      {latestFile && (
        <button
          type="button"
          onClick={onDownloadLatest}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 text-sm font-bold text-white no-underline transition-colors hover:bg-accent-strong"
        >
          <Download className="size-4" />
          Download latest
        </button>
      )}
      <CopyLinkButton className="mt-2 w-full" />
      <FollowProjectButton
        project={project}
        initialState={followState}
        onChanged={onFollowChanged}
      />
      <ProjectCollectionSave project={project} />

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
        <MetaRow label="Published" value={formatDate(project.published)} />
        {latestFile && (
          <MetaRow label="Latest file" value={formatBytes(latestFile.size)} />
        )}
      </div>

      {analytics && <ProjectAnalyticsSection analytics={analytics} />}

      <ProjectLifecycleSection project={project} />

      <ProjectLicenseSection project={project} onTagSearch={onTagSearch} />

      <LatestVersionSection
        version={latestVersion}
        onSelectVersion={onSelectVersion}
        onTagSearch={onTagSearch}
        projectType={project.projectType}
      />

      <ProjectLinksSection project={project} />

      <ProjectOwnershipSection members={members} project={project} />

      <ProjectCategoriesSection
        categories={project.categories}
        onTagSearch={onTagSearch}
        projectType={project.projectType}
      />

      {members.length > 0 && (
        <ProjectMembersSection members={members} projectSlug={project.slug} />
      )}

      <ProjectReportSection project={project} />
      <ProjectModerationNotes projectSlug={project.slug} />

      <SupportedVersionsSection
        versions={supportedVersions}
        onTagSearch={onTagSearch}
        projectType={project.projectType}
      />
    </aside>
  );
}
