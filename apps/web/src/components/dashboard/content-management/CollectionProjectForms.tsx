import {
  addProjectToCollection,
  removeProjectFromCollection,
  type DashboardCollection,
  type DashboardData,
} from '../../../lib/dashboard.ts';
import {
  ProjectRelationOperationForm,
  type ProjectRelationAction,
} from './project-relations/ProjectRelationOperationForm.tsx';

export function CollectionProjectForms({
  collections,
  onChanged,
  projects,
}: {
  collections: DashboardCollection[];
  onChanged: () => Promise<void>;
  projects: DashboardData['projects'];
}) {
  const addAction: ProjectRelationAction = {
    idleLabel: 'Add project to collection',
    pendingLabel: 'Adding...',
    run: addProjectToCollection,
  };
  const removeAction: ProjectRelationAction = {
    idleLabel: 'Remove from collection',
    pendingLabel: 'Removing...',
    run: removeProjectFromCollection,
  };

  return (
    <>
      <ProjectRelationOperationForm
        action={addAction}
        containerLabel="Collection"
        containers={collections}
        failureLabel="Collection update failed"
        projects={projects}
        onChanged={onChanged}
      />
      <ProjectRelationOperationForm
        action={removeAction}
        containerLabel="Collection"
        containers={collections}
        failureLabel="Collection update failed"
        projects={projects}
        onChanged={onChanged}
      />
    </>
  );
}
