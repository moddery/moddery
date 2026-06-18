import { type DashboardProject } from '../../../../lib/dashboard.ts';
import { projectTeamPermissions } from '../../../../lib/permissions.ts';
import { TeamPermissionsField } from '../../TeamPermissionsField.tsx';
import { DashboardField } from '../shared.tsx';

interface ProjectTeamFieldsProps {
  permissions: string[];
  projectSlug: string;
  projects: DashboardProject[];
  role: string;
  setPermissions: (value: string[]) => void;
  setProjectSlug: (value: string) => void;
  setRole: (value: string) => void;
  setUsername: (value: string) => void;
  username: string;
}

export function ProjectTeamFields({
  permissions,
  projectSlug,
  projects,
  role,
  setPermissions,
  setProjectSlug,
  setRole,
  setUsername,
  username,
}: ProjectTeamFieldsProps) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Project
          <select
            value={projectSlug}
            onChange={(event) => setProjectSlug(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
        <DashboardField
          label="Username"
          value={username}
          onChange={setUsername}
          required
        />
        <DashboardField label="Role" value={role} onChange={setRole} />
      </div>
      <TeamPermissionsField
        options={projectTeamPermissions}
        permissions={permissions}
        setPermissions={setPermissions}
      />
    </>
  );
}
