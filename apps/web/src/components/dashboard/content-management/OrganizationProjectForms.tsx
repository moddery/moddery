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
import { relationOrganizationHref } from './project-relations/relation-route-links.ts';

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
  const getOrganizationLink = (organizationId: string) => {
    const organization = organizations.find(
      (candidate) => candidate.id === organizationId,
    );

    return organization === undefined
      ? null
      : {
          href: relationOrganizationHref(organization),
          label: 'Open organization',
        };
  };

  return (
    <>
      <ProjectRelationOperationForm
        action={addAction}
        containerLabel="Organization"
        containers={organizations}
        failureLabel="Organization update failed"
        getContainerLink={getOrganizationLink}
        projects={projects}
        onChanged={onChanged}
      />
      <ProjectRelationOperationForm
        action={removeAction}
        containerLabel="Organization"
        containers={organizations}
        failureLabel="Organization update failed"
        getContainerLink={getOrganizationLink}
        projects={projects}
        onChanged={onChanged}
      />
    </>
  );
}
