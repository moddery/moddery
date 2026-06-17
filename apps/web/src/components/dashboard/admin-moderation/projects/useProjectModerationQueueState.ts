import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  fetchModerationProjectSearch,
  lockProjectForModeration,
  moderateProject,
  releaseProjectModerationLock,
} from '../../../../lib/dashboard.ts';
import { nullableText } from '../shared.tsx';

const projectModerationPageSize = 20;

export function useProjectModerationQueueState() {
  const [reason, setReason] = useState('');
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const projectsQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchModerationProjectSearch(page, projectModerationPageSize, signal),
    queryKey: ['dashboard', 'moderation-projects', page],
  });
  const projects = projectsQuery.data?.projects ?? [];
  const totalHits = projectsQuery.data?.totalHits ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalHits / projectModerationPageSize),
  );

  async function act(projectSlug: string, action: string) {
    setBusySlug(projectSlug);
    setMessage(null);

    try {
      await moderateProject({
        action,
        projectSlug,
        reason: nullableText(reason),
      });
      await projectsQuery.refetch();
      if (projects.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Project moderation failed',
      );
    } finally {
      setBusySlug(null);
    }
  }

  async function updateLock(projectSlug: string, action: 'lock' | 'release') {
    setBusySlug(projectSlug);
    setMessage(null);

    try {
      if (action === 'lock') {
        await lockProjectForModeration(projectSlug);
      } else {
        await releaseProjectModerationLock(projectSlug);
      }
      await projectsQuery.refetch();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Project lock update failed',
      );
    } finally {
      setBusySlug(null);
    }
  }

  return {
    act,
    busySlug,
    message,
    page,
    projects,
    projectsQuery,
    reason,
    setPage,
    setReason,
    totalHits,
    totalPages,
    updateLock,
  };
}
