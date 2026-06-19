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
  const projectsByCapability = dashboardProjectsByCapability(
    dashboard.projects,
  );

  return (
    <>
      {projectWorkflowFormOrder(projectsByCapability).map((item) =>
        projectWorkflowForm(item, projectsByCapability, onUpdated),
      )}
    </>
  );
}

export function projectWorkflowFormOrder(
  projectsByCapability: ProjectsByCapability,
): ProjectWorkflowFormKey[] {
  const items: ProjectWorkflowFormKey[] = ['publish-project'];

  if (projectsByCapability.all.length === 0) {
    return items;
  }

  if (projectsByCapability.manageDetails.length > 0) {
    items.push('project-metadata', 'project-gallery');
  }

  if (projectsByCapability.manageMembers.length > 0) {
    items.push('project-team');
  }

  if (projectsByCapability.viewAnalytics.length > 0) {
    items.push('project-analytics');
  }

  if (projectsByCapability.manageVersions.length > 0) {
    items.push('publish-version', 'edit-version', 'edit-version-dependencies');
  }

  return items;
}

export interface ProjectsByCapability {
  all: DashboardData['projects'];
  manageDetails: DashboardData['projects'];
  manageMembers: DashboardData['projects'];
  manageVersions: DashboardData['projects'];
  viewAnalytics: DashboardData['projects'];
}

export function dashboardProjectsByCapability(
  projects: DashboardData['projects'],
): ProjectsByCapability {
  return {
    all: projects,
    manageDetails: projects.filter(
      (project) => project.viewerCapabilities?.manageDetails === true,
    ),
    manageMembers: projects.filter(
      (project) => project.viewerCapabilities?.manageMembers === true,
    ),
    manageVersions: projects.filter(
      (project) => project.viewerCapabilities?.manageVersions === true,
    ),
    viewAnalytics: projects.filter(
      (project) => project.viewerCapabilities?.viewAnalytics === true,
    ),
  };
}

function projectsForWorkflowForm(
  item: Exclude<ProjectWorkflowFormKey, 'publish-project'>,
  projectsByCapability: ProjectsByCapability,
) {
  if (item === 'project-metadata' || item === 'project-gallery') {
    return projectsByCapability.manageDetails;
  }

  if (item === 'project-team') {
    return projectsByCapability.manageMembers;
  }

  if (item === 'project-analytics') {
    return projectsByCapability.viewAnalytics;
  }

  return projectsByCapability.manageVersions;
}

function projectWorkflowForm(
  item: ProjectWorkflowFormKey,
  projectsByCapability: ProjectsByCapability,
  onUpdated: () => Promise<void>,
) {
  if (item === 'publish-project') {
    return <PublishProjectForm key={item} onCreated={onUpdated} />;
  }

  const projects = projectsForWorkflowForm(item, projectsByCapability);

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
