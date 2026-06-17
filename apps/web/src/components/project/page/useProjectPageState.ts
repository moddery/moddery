import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  fetchProjectAnalytics,
  fetchProjectDetails,
  fetchProjectMembers,
  fetchProjectVersions,
  fetchViewerProjectFollowState,
  recordProjectView,
} from '../../../lib/catalog.ts';
import { compareVersions } from '../../../lib/format.ts';
import { type ProjectType } from '../../../types.ts';
import {
  defaultProjectTab,
  projectTabs,
  type ProjectTab,
} from '../ProjectContentTabs.tsx';

function readProjectTab(): ProjectTab {
  const tab = new URLSearchParams(window.location.search).get('tab');
  return projectTabs.some((item) => item.id === tab)
    ? (tab as ProjectTab)
    : defaultProjectTab;
}

export function useProjectPageState({
  projectTypeHint,
  slug,
}: {
  projectTypeHint: ProjectType;
  slug: string;
}) {
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
    const handlePopState = () => {
      setActiveTab(readProjectTab());
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [slug]);

  useEffect(() => {
    if (projectQuery.data?.project === undefined) return;

    void recordProjectView(slug).catch((error: unknown) => {
      if (import.meta.env.DEV) {
        console.error(error);
      }
    });
  }, [projectQuery.data?.project, slug]);

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
  const projectType = project?.project_type ?? projectTypeHint;
  const supportedVersions = [...(project?.game_versions ?? [])]
    .sort((a, b) => compareVersions(b, a))
    .slice(0, 14);
  const categories = project
    ? [...project.categories, ...project.additional_categories]
    : [];
  const gallery = [...(project?.gallery ?? [])].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.ordering - b.ordering;
  });
  const changelogVersions = versions.filter((version) =>
    version.changelog?.trim(),
  );

  return {
    activeTab,
    analytics,
    categories,
    changelogVersions,
    error,
    followState,
    gallery,
    latestFile,
    members,
    project,
    projectQuery,
    projectType,
    selectTab,
    supportedVersions,
    versions,
  };
}
