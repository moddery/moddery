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
import { FollowProjectButton } from './sidebar/FollowProjectButton.tsx';
import { MetaRow } from './sidebar/MetaRow.tsx';
import { ProjectAnalyticsSection } from './sidebar/ProjectAnalyticsSection.tsx';
import { ProjectCollectionSave } from './sidebar/ProjectCollectionSave.tsx';
import { ProjectLinksSection } from './sidebar/ProjectLinksSection.tsx';
import { ProjectMembersSection } from './sidebar/ProjectMembersSection.tsx';
import { ProjectModerationNotes } from './sidebar/ProjectModerationNotes.tsx';
import { ProjectReportSection } from './sidebar/ProjectReportSection.tsx';
import { SupportedVersionsSection } from './sidebar/SupportedVersionsSection.tsx';

export function ProjectSidebar({
  analytics,
  followState,
  latestFile,
  members,
  onDownloadLatest,
  project,
  supportedVersions,
}: {
  analytics: ProjectAnalytics | null;
  followState: ProjectFollowState | null;
  latestFile: ProjectVersion['files'][number] | undefined;
  members: ProjectMember[];
  onDownloadLatest: () => void;
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
      <FollowProjectButton project={project} initialState={followState} />
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
        <MetaRow label="License" value={project.license.id} />
        {latestFile && (
          <MetaRow label="Latest file" value={formatBytes(latestFile.size)} />
        )}
      </div>

      {analytics && <ProjectAnalyticsSection analytics={analytics} />}

      <ProjectLinksSection project={project} />

      {members.length > 0 && <ProjectMembersSection members={members} />}

      <ProjectReportSection project={project} />
      <ProjectModerationNotes projectSlug={project.slug} />

      <SupportedVersionsSection versions={supportedVersions} />
    </aside>
  );
}
