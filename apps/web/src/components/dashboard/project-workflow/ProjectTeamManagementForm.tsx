import { useQuery } from '@tanstack/react-query';

import { fetchProjectMembers } from '../../../lib/catalog.ts';
import { type DashboardProject } from '../../../lib/dashboard.ts';
import { ProjectTeamFields } from './team-management/ProjectTeamFields.tsx';
import { ProjectTeamMembersList } from './team-management/ProjectTeamMembersList.tsx';
import { useProjectTeamManagementState } from './team-management/useProjectTeamManagementState.ts';

export function ProjectTeamManagementForm({
  projects,
}: {
  projects: DashboardProject[];
}) {
  const state = useProjectTeamManagementState(projects);
  const membersQuery = useQuery({
    enabled: state.projectSlug.length > 0,
    queryFn: ({ signal }) => fetchProjectMembers(state.projectSlug, signal),
    queryKey: ['dashboard', 'project-team-members', state.projectSlug],
  });

  async function addMember(event: React.FormEvent<HTMLFormElement>) {
    await state.addMember(event);
    await membersQuery.refetch();
  }

  async function removeMember() {
    await state.removeMember();
    await membersQuery.refetch();
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Manage project team
        </h2>
        <p className="text-sm leading-6 text-muted">
          Add an existing user to a project team or remove a non-owner member.
        </p>
      </div>

      <form
        onSubmit={(event) => void addMember(event)}
        className="mt-4 grid gap-3"
      >
        <ProjectTeamFields
          permissions={state.permissions}
          projectSlug={state.projectSlug}
          projects={projects}
          role={state.role}
          setPermissions={state.setPermissions}
          setProjectSlug={state.setProjectSlug}
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
            {state.submitting ? 'Saving...' : 'Add team member'}
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
          members={membersQuery.data ?? []}
        />
      </form>
    </section>
  );
}
