import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  fetchProjectAnalytics,
  fetchProjectDetails,
  fetchProjectMemberSearch,
  fetchProjectVersions,
  fetchViewerProjectFollowState,
  recordDownload,
  recordProjectView,
  type DownloadRecord,
  type ProjectAnalytics,
  type ProjectDetails,
  type ProjectFollowState,
  type ProjectMember,
  type ProjectVersion,
  type ProjectVersionSearchResult,
  type ProjectViewRecord,
} from '../../../lib/catalog.ts';
import { compareVersions } from '../../../lib/format.ts';
import { type ProjectType } from '../../../types.ts';
import { type ProjectTab } from '../ProjectContentTabs.tsx';
import {
  readProjectTab,
  readSelectedVersion,
  writeProjectTab,
  writeSelectedVersion,
} from './projectPageUrlState.ts';

interface ProjectPageQueryData {
  analytics: ProjectAnalytics | null;
  followState: ProjectFollowState | null;
  members: ProjectMember[];
  project: ProjectDetails;
  versions: ProjectVersion[];
}

const viewedProjectSlugs = new Set<string>();

export function useProjectPageState({
  projectTypeHint,
  slug,
}: {
  projectTypeHint: ProjectType;
  slug: string;
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProjectTab>(readProjectTab);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(
    readSelectedVersion,
  );
  const projectQueryKey = ['catalog', 'project', slug] as const;
  const projectQuery = useQuery({
    queryFn: async ({ signal }): Promise<ProjectPageQueryData> => {
      const [project, versions, members, followState, analytics] =
        await Promise.all([
          fetchProjectDetails(slug, signal),
          fetchProjectVersions(slug, signal),
          fetchProjectMemberSearch(slug, 1, 12, signal),
          fetchViewerProjectFollowState(slug, signal),
          fetchProjectAnalytics(slug, signal),
        ]);

      return {
        analytics,
        followState,
        members: members.members,
        project,
        versions,
      };
    },
    queryKey: projectQueryKey,
  });

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(readProjectTab());
      setSelectedVersion(readSelectedVersion());
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [slug]);

  const projectSlugForView = projectQuery.data?.project.slug;

  useEffect(() => {
    if (projectSlugForView === undefined) return;
    if (viewedProjectSlugs.has(projectSlugForView)) return;

    viewedProjectSlugs.add(projectSlugForView);
    void recordProjectView(projectSlugForView)
      .then(updateProjectViewRecord)
      .catch((error: unknown) => {
        viewedProjectSlugs.delete(projectSlugForView);
        if (import.meta.env.DEV) {
          console.error(error);
        }
      });
  }, [projectSlugForView]);

  function selectTab(tab: ProjectTab) {
    setActiveTab(tab);

    if (tab !== 'versions') {
      setSelectedVersion(null);
    }

    writeProjectTab(tab);
  }

  function selectVersion(versionNumber: string | null) {
    setActiveTab('versions');
    setSelectedVersion(versionNumber);
    writeSelectedVersion(versionNumber);
  }

  function updateFollowState(followState: ProjectFollowState) {
    queryClient.setQueryData<ProjectPageQueryData>(
      projectQueryKey,
      (current) => {
        if (current === undefined) return current;

        return {
          ...current,
          followState,
          project: {
            ...current.project,
            followers: followState.followers,
          },
        };
      },
    );
  }

  function updateDownloadRecord(record: DownloadRecord) {
    queryClient.setQueryData<ProjectPageQueryData>(
      projectQueryKey,
      (current) => {
        if (current === undefined) return current;

        return {
          ...current,
          analytics:
            current.analytics === null
              ? null
              : {
                  ...current.analytics,
                  totalDownloads: record.projectDownloads,
                },
          project: {
            ...current.project,
            downloads: record.projectDownloads,
          },
          versions: updateVersionDownloads(current.versions, record),
        };
      },
    );

    queryClient.setQueriesData<ProjectVersionSearchResult>(
      { queryKey: ['catalog', 'project-version-search', slug] },
      (current) => {
        if (current === undefined) return current;

        return {
          ...current,
          versions: updateVersionDownloads(current.versions, record),
        };
      },
    );
  }

  function updateProjectViewRecord(record: ProjectViewRecord) {
    queryClient.setQueryData<ProjectPageQueryData>(
      projectQueryKey,
      (current) => {
        if (current === undefined) return current;
        if (current.project.slug !== record.projectSlug) return current;

        return {
          ...current,
          analytics:
            current.analytics === null
              ? null
              : {
                  ...current.analytics,
                  totalViews: current.analytics.totalViews + 1,
                  viewsLast30Days: current.analytics.viewsLast30Days + 1,
                },
        };
      },
    );
  }

  const project = projectQuery.data?.project;
  const versions = projectQuery.data?.versions ?? [];
  const members = projectQuery.data?.members ?? [];
  const followState = projectQuery.data?.followState ?? null;
  const analytics = projectQuery.data?.analytics ?? null;
  const error =
    projectQuery.error instanceof Error ? projectQuery.error.message : null;
  const latestVersion = versions[0];
  const latestFile =
    latestVersion?.files.find((file) => file.primary) ??
    latestVersion?.files[0];
  const projectType = project?.projectType ?? projectTypeHint;
  const supportedVersions = [...(project?.gameVersions ?? [])]
    .sort((a, b) => compareVersions(b, a))
    .slice(0, 14);
  const categories = project
    ? [...project.categories, ...project.additionalCategories]
    : [];
  const gallery = [...(project?.gallery ?? [])].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.ordering - b.ordering;
  });
  const changelogVersions = versions.filter((version) =>
    version.changelog?.trim(),
  );

  async function downloadLatestFile() {
    if (latestFile === undefined) {
      return;
    }

    updateDownloadRecord(await recordDownload(latestFile.id));
    window.location.assign(latestFile.url);
  }

  return {
    activeTab,
    analytics,
    categories,
    changelogVersions,
    error,
    followState,
    gallery,
    latestFile,
    latestVersion,
    members,
    downloadLatestFile,
    project,
    projectQuery,
    projectType,
    selectTab,
    selectedVersion,
    selectVersion,
    supportedVersions,
    updateDownloadRecord,
    updateFollowState,
    versions,
  };
}

function updateVersionDownloads(
  versions: ProjectVersion[],
  record: DownloadRecord,
): ProjectVersion[] {
  return versions.map((version) =>
    version.id === record.versionId
      ? { ...version, downloads: record.versionDownloads }
      : version,
  );
}
