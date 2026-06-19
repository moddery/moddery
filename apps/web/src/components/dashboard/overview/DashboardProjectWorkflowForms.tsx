import { type DashboardData } from '../../../lib/dashboard.ts';
import {
  AddGalleryImageForm,
  EditVersionDependencyForm,
  EditVersionForm,
  ProjectTeamManagementForm,
  PublishProjectForm,
  PublishVersionForm,
} from '../ProjectWorkflowPanels.tsx';
import { ProjectAnalyticsPanel } from '../ProjectInsightsPanels.tsx';
import { ProjectMetadataForm } from '../ProjectMetadataForm.tsx';

export type ProjectWorkflowFormKey =
  | 'publish-project'
  | 'project-metadata'
  | 'project-gallery'
  | 'project-team'
  | 'project-analytics'
  | 'publish-version'
  | 'edit-version'
  | 'edit-version-dependencies';

export function DashboardProjectWorkflowForms({
  dashboard,
  onUpdated,
}: {
  dashboard: DashboardData;
  onUpdated: () => Promise<void>;
}) {
  return (
    <>
      {projectWorkflowFormOrder(dashboard.projects.length > 0).map((item) =>
        projectWorkflowForm(item, dashboard.projects, onUpdated),
      )}
    </>
  );
}

export function projectWorkflowFormOrder(
  hasProjects: boolean,
): ProjectWorkflowFormKey[] {
  if (!hasProjects) {
    return ['publish-project'];
  }

  return [
    'publish-project',
    'project-metadata',
    'project-gallery',
    'project-team',
    'project-analytics',
    'publish-version',
    'edit-version',
    'edit-version-dependencies',
  ];
}

function projectWorkflowForm(
  item: ProjectWorkflowFormKey,
  projects: DashboardData['projects'],
  onUpdated: () => Promise<void>,
) {
  if (item === 'publish-project') {
    return <PublishProjectForm key={item} onCreated={onUpdated} />;
  }

  if (item === 'project-metadata') {
    return (
      <ProjectMetadataForm
        key={item}
        projects={projects}
        onUpdated={onUpdated}
      />
    );
  }

  if (item === 'project-gallery') {
    return (
      <AddGalleryImageForm key={item} projects={projects} onAdded={onUpdated} />
    );
  }

  if (item === 'project-team') {
    return <ProjectTeamManagementForm key={item} projects={projects} />;
  }

  if (item === 'project-analytics') {
    return <ProjectAnalyticsPanel key={item} projects={projects} />;
  }

  if (item === 'publish-version') {
    return (
      <PublishVersionForm
        key={item}
        projects={projects}
        onCreated={onUpdated}
      />
    );
  }

  if (item === 'edit-version') {
    return <EditVersionForm key={item} projects={projects} />;
  }

  return <EditVersionDependencyForm key={item} projects={projects} />;
}
