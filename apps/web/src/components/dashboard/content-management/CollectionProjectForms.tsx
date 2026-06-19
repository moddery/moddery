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
import { relationCollectionHref } from './project-relations/relation-route-links.ts';

export function CollectionProjectForms({
  collections,
  onChanged,
  ownerUsername,
  projects,
}: {
  collections: DashboardCollection[];
  onChanged: () => Promise<void>;
  ownerUsername: string;
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
  const getCollectionLink = (collectionId: string) => {
    const collection = collections.find(
      (candidate) => candidate.id === collectionId,
    );
    const href =
      collection === undefined
        ? null
        : relationCollectionHref(collection, ownerUsername);

    return href === null
      ? null
      : {
          href,
          label: 'Open collection',
        };
  };

  return (
    <>
      <ProjectRelationOperationForm
        action={addAction}
        containerLabel="Collection"
        containers={collections}
        failureLabel="Collection update failed"
        getContainerLink={getCollectionLink}
        projects={projects}
        onChanged={onChanged}
      />
      <ProjectRelationOperationForm
        action={removeAction}
        containerLabel="Collection"
        containers={collections}
        failureLabel="Collection update failed"
        getContainerLink={getCollectionLink}
        projects={projects}
        onChanged={onChanged}
      />
    </>
  );
}
