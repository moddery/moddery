import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchProjectMemberSearch } from '../../../lib/catalog.ts';
import { type DashboardProject } from '../../../lib/dashboard.ts';
import { Pagination } from '../../Pagination.tsx';
import { CollapsiblePanel } from '../../ui/dashboard/index.ts';
import { ProjectTeamFields } from './team-management/ProjectTeamFields.tsx';
import { ProjectTeamMembersList } from './team-management/ProjectTeamMembersList.tsx';
import { useProjectTeamManagementState } from './team-management/useProjectTeamManagementState.ts';

const memberPageSize = 12;

export function ProjectTeamManagementForm({
  defaultOpen = false,
  projects,
}: {
  defaultOpen?: boolean;
  projects: DashboardProject[];
}) {
  const state = useProjectTeamManagementState(projects);
  const [memberPage, setMemberPage] = useState(1);
  const membersQuery = useQuery({
    enabled: state.projectSlug.length > 0,
    queryFn: ({ signal }) =>
      fetchProjectMemberSearch(
        state.projectSlug,
        memberPage,
        memberPageSize,
        signal,
      ),
    queryKey: [
      'dashboard',
      'project-team-members',
      state.projectSlug,
      memberPage,
    ],
  });
  const totalMembers = membersQuery.data?.totalHits ?? 0;
  const totalMemberPages = Math.max(
    1,
    Math.ceil(totalMembers / memberPageSize),
  );

  async function addMember(event: React.FormEvent<HTMLFormElement>) {
    await state.addMember(event);
    setMemberPage(1);
    if (memberPage === 1) {
      await membersQuery.refetch();
    }
  }

  async function removeMember() {
    await state.removeMember();
    setMemberPage(1);
    if (memberPage === 1) {
      await membersQuery.refetch();
    }
  }

  function selectProject(slug: string) {
    state.setProjectSlug(slug);
    setMemberPage(1);
  }

  return (
    <CollapsiblePanel
      defaultOpen={defaultOpen}
      title="Manage project team"
      description="Invite an existing user to a project team or remove a non-owner member."
    >
      <form
        onSubmit={(event) => void addMember(event)}
        className="mt-4 grid gap-3"
      >
        <ProjectTeamFields
          disabled={state.submitting}
          permissions={state.permissions}
          projectSlug={state.projectSlug}
          projects={projects}
          role={state.role}
          setPermissions={state.setPermissions}
          setProjectSlug={selectProject}
          setRole={state.setRole}
          setUsername={state.setUsername}
          username={state.username}
        />

        {state.message && (
          <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
            {state.message}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={state.submitting}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {projectTeamInviteButtonLabel(state.submitting)}
          </button>
          <button
            type="button"
            disabled={state.submitting || state.username.trim() === ''}
            onClick={() => void removeMember()}
            className="inline-flex h-10 items-center rounded-lg border border-line bg-control px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            Remove member
          </button>
        </div>

        <ProjectTeamMembersList
          isLoading={membersQuery.isLoading}
          members={membersQuery.data?.members ?? []}
        />
        {totalMemberPages > 1 && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted">
              {totalMembers.toLocaleString('en-US')} members
            </span>
            <Pagination
              page={memberPage}
              totalPages={totalMemberPages}
              onPage={setMemberPage}
            />
          </div>
        )}
      </form>
    </CollapsiblePanel>
  );
}

export function projectTeamInviteButtonLabel(submitting: boolean) {
  return submitting ? 'Saving...' : 'Invite member';
}
