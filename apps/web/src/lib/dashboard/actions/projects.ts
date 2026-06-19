import { apolloClient } from '../../../apollo.js';
import { type Mod } from '../../../types.js';
import { projectTypeFromKind } from '../../projectTypes.js';
import {
  CREATE_PROJECT_MUTATION,
  ADD_PROJECT_GALLERY_IMAGE_MUTATION,
  ADD_PROJECT_TEAM_MEMBER_MUTATION,
  REMOVE_PROJECT_TEAM_MEMBER_MUTATION,
  REMOVE_PROJECT_GALLERY_IMAGE_MUTATION,
  UPDATE_PROJECT_MUTATION,
  UPDATE_PROJECT_GALLERY_IMAGE_MUTATION,
} from '../graphql.js';
import {
  type CreateProjectMutationData,
  type CreateProjectMutationVariables,
  type AddProjectGalleryImageMutationData,
  type AddProjectTeamMemberMutationData,
  type RemoveProjectGalleryImageMutationData,
  type RemoveProjectTeamMemberMutationData,
  type AddProjectGalleryImageMutationVariables,
  type AddProjectTeamMemberMutationVariables,
  type RemoveProjectGalleryImageMutationVariables,
  type RemoveProjectTeamMemberMutationVariables,
  type UpdateProjectGalleryImageMutationData,
  type UpdateProjectGalleryImageMutationVariables,
  type UpdateProjectMutationData,
  type UpdateProjectMutationVariables,
} from '../internal-types.js';
import {
  type AddProjectGalleryImageInput,
  type AddProjectTeamMemberInput,
  type CreateProjectInput,
  type DashboardProject,
  type DashboardProjectMember,
  type RemoveProjectGalleryImageInput,
  type RemoveProjectTeamMemberInput,
  type UpdateProjectGalleryImageInput,
  type UpdateProjectInput,
} from '../types.js';

export async function createProject(
  input: CreateProjectInput,
): Promise<DashboardProject> {
  const { data } = await apolloClient.mutate<
    CreateProjectMutationData,
    CreateProjectMutationVariables
  >({
    mutation: CREATE_PROJECT_MUTATION,
    variables: { input },
  });

  if (!data?.createProject) {
    throw new Error('Project creation did not return a project');
  }

  return data.createProject;
}

export async function addProjectGalleryImage(
  input: AddProjectGalleryImageInput,
): Promise<DashboardProject> {
  const { data } = await apolloClient.mutate<
    AddProjectGalleryImageMutationData,
    AddProjectGalleryImageMutationVariables
  >({
    mutation: ADD_PROJECT_GALLERY_IMAGE_MUTATION,
    variables: { input },
  });

  if (!data?.addProjectGalleryImage) {
    throw new Error('Gallery image creation did not return a project');
  }

  return data.addProjectGalleryImage;
}

export async function removeProjectGalleryImage(
  input: RemoveProjectGalleryImageInput,
): Promise<DashboardProject> {
  const { data } = await apolloClient.mutate<
    RemoveProjectGalleryImageMutationData,
    RemoveProjectGalleryImageMutationVariables
  >({
    mutation: REMOVE_PROJECT_GALLERY_IMAGE_MUTATION,
    variables: { input },
  });

  if (!data?.removeProjectGalleryImage) {
    throw new Error('Gallery image removal did not return a project');
  }

  return data.removeProjectGalleryImage;
}

export async function updateProjectGalleryImage(
  input: UpdateProjectGalleryImageInput,
): Promise<DashboardProject> {
  const { data } = await apolloClient.mutate<
    UpdateProjectGalleryImageMutationData,
    UpdateProjectGalleryImageMutationVariables
  >({
    mutation: UPDATE_PROJECT_GALLERY_IMAGE_MUTATION,
    variables: { input },
  });

  if (!data?.updateProjectGalleryImage) {
    throw new Error('Gallery image update did not return a project');
  }

  return data.updateProjectGalleryImage;
}

export async function addProjectTeamMember(
  input: AddProjectTeamMemberInput,
): Promise<DashboardProjectMember[]> {
  const { data } = await apolloClient.mutate<
    AddProjectTeamMemberMutationData,
    AddProjectTeamMemberMutationVariables
  >({
    mutation: ADD_PROJECT_TEAM_MEMBER_MUTATION,
    variables: { input },
  });

  if (!data?.addProjectTeamMember) {
    throw new Error('Team update did not return members');
  }

  return data.addProjectTeamMember;
}

export async function removeProjectTeamMember(
  input: RemoveProjectTeamMemberInput,
): Promise<DashboardProjectMember[]> {
  const { data } = await apolloClient.mutate<
    RemoveProjectTeamMemberMutationData,
    RemoveProjectTeamMemberMutationVariables
  >({
    mutation: REMOVE_PROJECT_TEAM_MEMBER_MUTATION,
    variables: { input },
  });

  if (!data?.removeProjectTeamMember) {
    throw new Error('Team update did not return members');
  }

  return data.removeProjectTeamMember;
}

export async function updateProject(
  input: UpdateProjectInput,
): Promise<DashboardProject> {
  const { data } = await apolloClient.mutate<
    UpdateProjectMutationData,
    UpdateProjectMutationVariables
  >({
    mutation: UPDATE_PROJECT_MUTATION,
    variables: { input },
  });

  if (!data?.updateProject) {
    throw new Error('Project update did not return a project');
  }

  return data.updateProject;
}

export function dashboardProjectToMod(project: DashboardProject): Mod {
  const organizationName = project.organization?.name.trim() ?? '';
  const ownerName =
    project.owner?.displayName ?? project.owner?.username ?? 'Unknown user';

  return {
    author: organizationName || ownerName,
    authorUsername: project.owner?.username ?? null,
    categories: project.categories,
    client: 'optional',
    color: project.color,
    description: project.summary,
    downloads: project.downloads,
    follows: project.followers,
    gameVersions: project.gameVersions,
    icon: project.iconUrl,
    loaders: project.loaders.map((loader) => loader.toLowerCase()),
    organization: project.organization ?? null,
    projectType: projectTypeFromKind(project.kind),
    server: 'optional',
    slug: project.slug,
    title: project.title,
    updated: project.updatedAt,
  };
}
