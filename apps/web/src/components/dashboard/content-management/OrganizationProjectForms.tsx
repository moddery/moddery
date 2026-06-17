import {
  addProjectToOrganization,
  removeProjectFromOrganization,
  type DashboardData,
  type DashboardOrganization,
} from '../../../lib/dashboard.ts';
import {
  ProjectRelationOperationForm,
  type ProjectRelationAction,
} from './project-relations/ProjectRelationOperationForm.tsx';

export function OrganizationProjectForms({
  onChanged,
  organizations,
  projects,
}: {
  onChanged: () => Promise<void>;
  organizations: DashboardOrganization[];
  projects: DashboardData['projects'];
}) {
  const addAction: ProjectRelationAction = {
    idleLabel: 'Add project to organization',
    pendingLabel: 'Adding...',
    run: addProjectToOrganization,
  };
  const removeAction: ProjectRelationAction = {
    idleLabel: 'Remove from organization',
    pendingLabel: 'Removing...',
    run: removeProjectFromOrganization,
  };

  return (
    <>
      <ProjectRelationOperationForm
        action={addAction}
        containerLabel="Organization"
        containers={organizations}
        failureLabel="Organization update failed"
        projects={projects}
        onChanged={onChanged}
      />
      <ProjectRelationOperationForm
        action={removeAction}
        containerLabel="Organization"
        containers={organizations}
        failureLabel="Organization update failed"
        projects={projects}
        onChanged={onChanged}
      />
    </>
  );
}
