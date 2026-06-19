import { ExternalLink } from 'lucide-react';

import {
  dashboardProjectToMod,
  type DashboardData,
  type DashboardProject,
} from '../../../../lib/dashboard.ts';
import { timeAgo } from '../../../../lib/format.ts';
import { enumLabel } from '../../../../lib/labels.ts';
import { type Mod } from '../../../../types.ts';
import { ModCard, type SearchTag } from '../../../ModCard.tsx';

export function ProjectsSummary({
  dashboard,
  onOpenProject,
  onTagSearch,
}: {
  dashboard: DashboardData;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Your projects
        </h2>
        <span className="text-sm font-semibold text-muted">
          {dashboard.projectCount.toLocaleString('en-US')} total
        </span>
      </div>

      {dashboard.projects.length === 0 ? (
        <p className="py-8 text-sm text-muted">
          Published projects you manage will show up here.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {dashboard.projects.map((project) => {
            const mod = dashboardProjectToMod(project);
            return (
              <div key={project.slug} className="space-y-2">
                {isPublicDashboardProject(project) ? (
                  <ModCard
                    mod={mod}
                    layout="list"
                    onOpen={onOpenProject}
                    onTagSearch={onTagSearch}
                  />
                ) : (
                  <ManagedProjectCard project={project} />
                )}
                <ProjectLifecycleSummary project={project} />
                <ProjectLinkSummary project={project} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ManagedProjectCard({ project }: { project: DashboardProject }) {
  return (
    <article className="rounded-lg border border-line bg-surface px-4 py-3">
      <div className="flex gap-4">
        {project.iconUrl ? (
          <img
            src={project.iconUrl}
            alt={`${project.title} icon`}
            loading="lazy"
            width={64}
            height={64}
            className="size-16 shrink-0 rounded-md bg-surface-2 object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="size-16 shrink-0 rounded-md bg-surface-2"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-balance font-display text-lg font-extrabold text-ink">
              {project.title}
            </h3>
            <span className="rounded-md bg-control px-2 py-1 text-xs font-extrabold text-muted">
              {enumLabel(project.status)}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-pretty text-sm text-muted">
            {project.summary}
          </p>
          <p className="mt-3 text-xs font-semibold text-muted">
            {managedProjectStatusMessage(project)}
          </p>
        </div>
      </div>
    </article>
  );
}

export function isPublicDashboardProject(
  project: Pick<DashboardProject, 'status'>,
) {
  return project.status === 'APPROVED';
}

export function managedProjectStatusMessage(
  project: Pick<DashboardProject, 'status'>,
) {
  if (project.status === 'PENDING_REVIEW') {
    return 'Queued projects are visible here while moderators review them.';
  }

  if (project.status === 'REJECTED') {
    return 'Rejected projects are private until their metadata is ready for another review.';
  }

  if (project.status === 'ARCHIVED') {
    return 'Archived projects are private until restored by moderation.';
  }

  return 'This project is not public yet.';
}

function ProjectLifecycleSummary({ project }: { project: DashboardProject }) {
  const items = [
    { label: 'Status', value: enumLabel(project.status) },
    {
      label: 'Requested',
      value: project.requestedStatus
        ? enumLabel(project.requestedStatus)
        : null,
    },
    { label: 'Published', value: formatLifecycleDate(project.publishedAt) },
    { label: 'Queued', value: formatLifecycleDate(project.queuedAt) },
    { label: 'Approved', value: formatLifecycleDate(project.approvedAt) },
    { label: 'Archived', value: formatLifecycleDate(project.archivedAt) },
  ].filter((item) => Boolean(item.value));

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 text-xs font-semibold text-muted">
      {items.map((item) => (
        <span key={item.label}>
          {item.label}: <span className="text-ink">{item.value}</span>
        </span>
      ))}
    </div>
  );
}

export interface ProjectSummaryLink {
  href: string;
  key: string;
  label: string;
}

export function projectSummaryLinks(
  project: Pick<
    DashboardProject,
    'discordUrl' | 'issuesUrl' | 'license' | 'links' | 'sourceUrl' | 'wikiUrl'
  >,
): ProjectSummaryLink[] {
  return [
    { href: project.sourceUrl, key: 'source', label: 'Source' },
    { href: project.issuesUrl, key: 'issues', label: 'Issues' },
    { href: project.wikiUrl, key: 'wiki', label: 'Wiki' },
    { href: project.discordUrl, key: 'discord', label: 'Discord' },
    {
      href: project.license.url,
      key: 'license',
      label: project.license.name,
    },
    ...project.links.map((link, index) => ({
      href: link.url,
      key: `link-${index.toString()}-${link.url}`,
      label: enumLabel(link.label ?? link.kind),
    })),
  ].filter((link): link is ProjectSummaryLink => Boolean(link.href));
}

function ProjectLinkSummary({ project }: { project: DashboardProject }) {
  const links = projectSummaryLinks(project);

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-1">
      {links.map((link) => (
        <a
          key={link.key}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full items-center gap-1 rounded-md bg-control px-2 py-1 text-xs font-bold text-muted transition-colors hover:bg-control-hover hover:text-ink"
        >
          <span className="truncate">{link.label}</span>
          <ExternalLink className="size-3 shrink-0 text-accent-icon" />
        </a>
      ))}
    </div>
  );
}

function formatLifecycleDate(value?: string | null) {
  return value ? timeAgo(value) : null;
}
