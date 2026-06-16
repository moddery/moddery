import { gql } from '@apollo/client';
import {
  type CollectionVisibility,
  type DependencyKind,
  type ProjectKind,
} from '@moddery/shared';

import { apolloClient } from '../apollo.js';
import { type Mod } from '../types.js';
import { projectTypeFromKind } from './projectTypes.js';

export interface DashboardData {
  avatarUrl: string | null;
  bio: string | null;
  collectionCount: number;
  collections: DashboardCollection[];
  displayName: string | null;
  followedProjectCount: number;
  id: string;
  isAdmin: boolean;
  organizations: DashboardOrganization[];
  projectCount: number;
  projects: DashboardProject[];
  role: string;
  username: string;
}

export interface DashboardCollection {
  color: string | null;
  description: string | null;
  id: string;
  name: string;
  projectCount: number;
  slug: string;
  updatedAt: string;
  visibility: CollectionVisibility;
}

export interface DashboardProject {
  body: string;
  categories: string[];
  discordUrl: string | null;
  downloads: number;
  followers: number;
  gallery: DashboardGalleryImage[];
  gameVersions: string[];
  iconUrl: string | null;
  issuesUrl: string | null;
  kind: ProjectKind;
  loaders: string[];
  slug: string;
  sourceUrl: string | null;
  summary: string;
  title: string;
  updatedAt: string;
  wikiUrl: string | null;
}

export interface DashboardProjectMember {
  accepted: boolean;
  owner: boolean;
  role: string;
  sortOrder: number;
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
}

export interface DashboardGalleryImage {
  createdAt: string;
  description: string | null;
  displayUrl: string;
  featured: boolean;
  rawUrl: string;
  sortOrder: number;
  title: string | null;
}

export interface DashboardOrganization {
  color: string | null;
  description: string | null;
  id: string;
  memberCount: number;
  name: string;
  projectCount: number;
  slug: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  categories: string[];
  description: string;
  gameVersions: string[];
  kind: ProjectKind;
  loaders: string[];
  slug: string;
  summary: string;
  title: string;
}

export interface CreateCollectionInput {
  color: string | null;
  description: string | null;
  name: string;
  slug: string;
  visibility: CollectionVisibility;
}

export interface UpdateCollectionInput {
  collectionId: string;
  color: string | null;
  description: string | null;
  name: string;
  slug: string;
  visibility: CollectionVisibility;
}

export interface CreateOrganizationInput {
  color: string | null;
  description: string | null;
  name: string;
  slug: string;
}

export interface UpdateOrganizationInput {
  color: string | null;
  description: string | null;
  name: string;
  organizationId: string;
  slug: string;
}

export interface UpdateProjectInput {
  categories: string[];
  description: string;
  discordUrl: string | null;
  gameVersions: string[];
  iconUrl: string | null;
  issuesUrl: string | null;
  loaders: string[];
  projectSlug: string;
  sourceUrl: string | null;
  summary: string;
  title: string;
  wikiUrl: string | null;
}

export interface UpdateViewerProfileInput {
  avatarUrl: string | null;
  bio: string | null;
  displayName: string | null;
}

export interface ViewerProfileUpdate {
  avatarUrl: string | null;
  bio: string | null;
  displayName: string | null;
  id: string;
  username: string;
}

export interface AddProjectGalleryImageInput {
  description: string | null;
  displayUrl: string;
  featured: boolean;
  projectSlug: string;
  rawUrl: string;
  sortOrder: number | null;
  title: string | null;
}

export interface AddProjectTeamMemberInput {
  permissions: string[];
  projectSlug: string;
  role: string;
  username: string;
}

export interface RemoveProjectTeamMemberInput {
  projectSlug: string;
  username: string;
}

export interface CreateVersionInput {
  changelog: string | null;
  channel: 'ALPHA' | 'BETA' | 'RELEASE';
  files: {
    fileName: string;
    primary: boolean;
    sizeBytes: number;
    url: string;
  }[];
  gameVersions: string[];
  loaders: string[];
  name: string;
  projectSlug: string;
  versionNumber: string;
}

export interface DashboardVersion {
  changelog: string | null;
  channel: 'ALPHA' | 'BETA' | 'RELEASE';
  dependencies: DashboardVersionDependency[];
  gameVersions: string[];
  id: string;
  loaders: string[];
  name: string;
  projectSlug: string;
  versionNumber: string;
}

export interface DashboardVersionDependency {
  dependencyKind: DependencyKind;
  externalFileName: string | null;
  id: string;
  targetProject: {
    id: string;
    slug: string;
    title: string;
  } | null;
  targetVersion: {
    id: string;
    versionNumber: string;
  } | null;
}

export interface VersionDependencyInput {
  dependencyKind: DependencyKind;
  externalFileName: string | null;
  targetProjectSlug: string | null;
  targetVersionId: string | null;
}

export interface UpdateVersionDependenciesInput {
  dependencies: VersionDependencyInput[];
  versionId: string;
}

export interface UpdateVersionInput {
  changelog: string | null;
  channel: 'ALPHA' | 'BETA' | 'RELEASE';
  gameVersions: string[];
  loaders: string[];
  name: string;
  versionId: string;
  versionNumber: string;
}

export interface ModerationReport {
  body: string;
  createdAt: string;
  id: string;
  project: {
    id: string;
    slug: string;
    title: string;
  } | null;
  projectId: string | null;
  reason: string;
  reporter: {
    displayName: string | null;
    id: string;
    username: string;
  } | null;
  state: string;
  userTarget: {
    displayName: string | null;
    id: string;
    username: string;
  } | null;
  userTargetId: string | null;
  versionId: string | null;
}

export type ModerationReportState = 'OPEN' | 'TRIAGED' | 'CLOSED';

interface DashboardQueryData {
  viewer: DashboardData | null;
  viewerOrganizations: DashboardOrganization[];
}

interface UpdateViewerProfileMutationData {
  updateViewerProfile: ViewerProfileUpdate | null;
}

interface UpdateViewerProfileMutationVariables {
  input: UpdateViewerProfileInput;
}

interface ModerationReportsQueryData {
  moderationReports: ModerationReport[];
}

interface UpdateReportStateMutationData {
  updateReportState: ModerationReport;
}

interface UpdateReportStateMutationVariables {
  input: {
    id: string;
    state: ModerationReportState;
  };
}

interface CreateProjectMutationData {
  createProject: DashboardProject;
}

interface CreateProjectMutationVariables {
  input: CreateProjectInput;
}

interface AddProjectGalleryImageMutationData {
  addProjectGalleryImage: DashboardProject;
}

interface AddProjectTeamMemberMutationData {
  addProjectTeamMember: DashboardProjectMember[];
}

interface RemoveProjectTeamMemberMutationData {
  removeProjectTeamMember: DashboardProjectMember[];
}

interface AddProjectGalleryImageMutationVariables {
  input: AddProjectGalleryImageInput;
}

interface AddProjectTeamMemberMutationVariables {
  input: AddProjectTeamMemberInput;
}

interface RemoveProjectTeamMemberMutationVariables {
  input: RemoveProjectTeamMemberInput;
}

interface UpdateProjectMutationData {
  updateProject: DashboardProject;
}

interface UpdateProjectMutationVariables {
  input: UpdateProjectInput;
}

interface CreateCollectionMutationData {
  createCollection: DashboardCollection;
}

interface CreateCollectionMutationVariables {
  input: CreateCollectionInput;
}

interface UpdateCollectionMutationData {
  updateCollection: DashboardCollection;
}

interface UpdateCollectionMutationVariables {
  input: UpdateCollectionInput;
}

interface CreateOrganizationMutationData {
  createOrganization: DashboardOrganization;
}

interface CreateOrganizationMutationVariables {
  input: CreateOrganizationInput;
}

interface UpdateOrganizationMutationData {
  updateOrganization: DashboardOrganization;
}

interface UpdateOrganizationMutationVariables {
  input: UpdateOrganizationInput;
}

interface AddProjectToOrganizationMutationData {
  addProjectToOrganization: DashboardOrganization;
}

interface RemoveProjectFromOrganizationMutationData {
  removeProjectFromOrganization: DashboardOrganization;
}

interface AddProjectToOrganizationMutationVariables {
  input: {
    organizationId: string;
    projectSlug: string;
  };
}

interface RemoveProjectFromOrganizationMutationVariables {
  input: {
    organizationId: string;
    projectSlug: string;
  };
}

interface AddProjectToCollectionMutationData {
  addProjectToCollection: DashboardCollection;
}

interface RemoveProjectFromCollectionMutationData {
  removeProjectFromCollection: DashboardCollection;
}

interface AddProjectToCollectionMutationVariables {
  input: {
    collectionId: string;
    projectSlug: string;
  };
}

interface RemoveProjectFromCollectionMutationVariables {
  input: {
    collectionId: string;
    projectSlug: string;
  };
}

interface CreateVersionMutationData {
  createVersion: DashboardVersion;
}

interface CreateVersionMutationVariables {
  input: CreateVersionInput;
}

interface UpdateVersionMutationData {
  updateVersion: DashboardVersion;
}

interface UpdateVersionMutationVariables {
  input: UpdateVersionInput;
}

interface UpdateVersionDependenciesMutationData {
  updateVersionDependencies: DashboardVersion;
}

interface UpdateVersionDependenciesMutationVariables {
  input: UpdateVersionDependenciesInput;
}

const DASHBOARD_QUERY = gql`
  query Dashboard {
    viewer {
      avatarUrl
      bio
      collectionCount
      collections {
        color
        description
        id
        name
        projectCount
        slug
        updatedAt
        visibility
      }
      displayName
      followedProjectCount
      id
      isAdmin
      projectCount
      projects {
        body
        categories
        discordUrl
        downloads
        followers
        gallery {
          createdAt
          description
          displayUrl
          featured
          rawUrl
          sortOrder
          title
        }
        gameVersions
        iconUrl
        issuesUrl
        kind
        loaders
        slug
        sourceUrl
        summary
        title
        updatedAt
        wikiUrl
      }
      role
      username
    }
    viewerOrganizations {
      color
      description
      id
      memberCount
      name
      projectCount
      slug
      updatedAt
      visibility
    }
  }
`;

const UPDATE_VIEWER_PROFILE_MUTATION = gql`
  mutation UpdateViewerProfile($input: UpdateViewerProfileInput!) {
    updateViewerProfile(input: $input) {
      avatarUrl
      bio
      displayName
      id
      username
    }
  }
`;

const MODERATION_REPORTS_QUERY = gql`
  query ModerationReports {
    moderationReports {
      body
      createdAt
      id
      project {
        id
        slug
        title
      }
      projectId
      reason
      reporter {
        displayName
        id
        username
      }
      state
      userTarget {
        displayName
        id
        username
      }
      userTargetId
      versionId
    }
  }
`;

const UPDATE_REPORT_STATE_MUTATION = gql`
  mutation UpdateReportState($input: UpdateReportStateInput!) {
    updateReportState(input: $input) {
      body
      createdAt
      id
      project {
        id
        slug
        title
      }
      projectId
      reason
      reporter {
        displayName
        id
        username
      }
      state
      userTarget {
        displayName
        id
        username
      }
      userTargetId
      versionId
    }
  }
`;

const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      body
      categories
      discordUrl
      downloads
      followers
      gallery {
        createdAt
        description
        displayUrl
        featured
        rawUrl
        sortOrder
        title
      }
      gameVersions
      iconUrl
      issuesUrl
      kind
      loaders
      slug
      sourceUrl
      summary
      title
      updatedAt
      wikiUrl
    }
  }
`;

const ADD_PROJECT_GALLERY_IMAGE_MUTATION = gql`
  mutation AddProjectGalleryImage($input: AddProjectGalleryImageInput!) {
    addProjectGalleryImage(input: $input) {
      body
      categories
      discordUrl
      downloads
      followers
      gallery {
        createdAt
        description
        displayUrl
        featured
        rawUrl
        sortOrder
        title
      }
      gameVersions
      iconUrl
      issuesUrl
      kind
      loaders
      slug
      sourceUrl
      summary
      title
      updatedAt
      wikiUrl
    }
  }
`;

const ADD_PROJECT_TEAM_MEMBER_MUTATION = gql`
  mutation AddProjectTeamMember($input: AddProjectTeamMemberInput!) {
    addProjectTeamMember(input: $input) {
      accepted
      owner
      role
      sortOrder
      user {
        avatarUrl
        displayName
        id
        username
      }
    }
  }
`;

const REMOVE_PROJECT_TEAM_MEMBER_MUTATION = gql`
  mutation RemoveProjectTeamMember($input: RemoveProjectTeamMemberInput!) {
    removeProjectTeamMember(input: $input) {
      accepted
      owner
      role
      sortOrder
      user {
        avatarUrl
        displayName
        id
        username
      }
    }
  }
`;

const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      body
      categories
      discordUrl
      downloads
      followers
      gallery {
        createdAt
        description
        displayUrl
        featured
        rawUrl
        sortOrder
        title
      }
      gameVersions
      iconUrl
      issuesUrl
      kind
      loaders
      slug
      sourceUrl
      summary
      title
      updatedAt
      wikiUrl
    }
  }
`;

const CREATE_COLLECTION_MUTATION = gql`
  mutation CreateCollection($input: CreateCollectionInput!) {
    createCollection(input: $input) {
      color
      description
      id
      name
      projectCount
      slug
      updatedAt
      visibility
    }
  }
`;

const UPDATE_COLLECTION_MUTATION = gql`
  mutation UpdateCollection($input: UpdateCollectionInput!) {
    updateCollection(input: $input) {
      color
      description
      id
      name
      projectCount
      slug
      updatedAt
      visibility
    }
  }
`;

const CREATE_ORGANIZATION_MUTATION = gql`
  mutation CreateOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      color
      description
      id
      memberCount
      name
      projectCount
      slug
      updatedAt
    }
  }
`;

const UPDATE_ORGANIZATION_MUTATION = gql`
  mutation UpdateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      color
      description
      id
      memberCount
      name
      projectCount
      slug
      updatedAt
    }
  }
`;

const ADD_PROJECT_TO_ORGANIZATION_MUTATION = gql`
  mutation AddProjectToOrganization($input: AddProjectToOrganizationInput!) {
    addProjectToOrganization(input: $input) {
      color
      description
      id
      memberCount
      name
      projectCount
      slug
      updatedAt
    }
  }
`;

const REMOVE_PROJECT_FROM_ORGANIZATION_MUTATION = gql`
  mutation RemoveProjectFromOrganization(
    $input: RemoveProjectFromOrganizationInput!
  ) {
    removeProjectFromOrganization(input: $input) {
      color
      description
      id
      memberCount
      name
      projectCount
      slug
      updatedAt
    }
  }
`;

const ADD_PROJECT_TO_COLLECTION_MUTATION = gql`
  mutation AddProjectToCollection($input: AddProjectToCollectionInput!) {
    addProjectToCollection(input: $input) {
      color
      description
      id
      name
      projectCount
      slug
      updatedAt
    }
  }
`;

const REMOVE_PROJECT_FROM_COLLECTION_MUTATION = gql`
  mutation RemoveProjectFromCollection(
    $input: RemoveProjectFromCollectionInput!
  ) {
    removeProjectFromCollection(input: $input) {
      color
      description
      id
      name
      projectCount
      slug
      updatedAt
      visibility
    }
  }
`;

const CREATE_VERSION_MUTATION = gql`
  mutation CreateVersion($input: CreateVersionInput!) {
    createVersion(input: $input) {
      changelog
      channel
      dependencies {
        dependencyKind
        externalFileName
        id
        targetProject {
          id
          slug
          title
        }
        targetVersion {
          id
          versionNumber
        }
      }
      gameVersions
      id
      loaders
      name
      projectSlug
      versionNumber
    }
  }
`;

const UPDATE_VERSION_MUTATION = gql`
  mutation UpdateVersion($input: UpdateVersionInput!) {
    updateVersion(input: $input) {
      changelog
      channel
      dependencies {
        dependencyKind
        externalFileName
        id
        targetProject {
          id
          slug
          title
        }
        targetVersion {
          id
          versionNumber
        }
      }
      gameVersions
      id
      loaders
      name
      projectSlug
      versionNumber
    }
  }
`;

const UPDATE_VERSION_DEPENDENCIES_MUTATION = gql`
  mutation UpdateVersionDependencies($input: UpdateVersionDependenciesInput!) {
    updateVersionDependencies(input: $input) {
      changelog
      channel
      dependencies {
        dependencyKind
        externalFileName
        id
        targetProject {
          id
          slug
          title
        }
        targetVersion {
          id
          versionNumber
        }
      }
      gameVersions
      id
      loaders
      name
      projectSlug
      versionNumber
    }
  }
`;

export async function fetchDashboard(
  signal?: AbortSignal,
): Promise<DashboardData | null> {
  const { data } = await apolloClient.query<DashboardQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: DASHBOARD_QUERY,
  });

  if (data.viewer === null) return null;

  return {
    ...data.viewer,
    organizations: data.viewerOrganizations,
  };
}

export async function fetchModerationReports(
  signal?: AbortSignal,
): Promise<ModerationReport[]> {
  const { data } = await apolloClient.query<ModerationReportsQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: MODERATION_REPORTS_QUERY,
  });

  return data.moderationReports;
}

export async function updateViewerProfile(
  input: UpdateViewerProfileInput,
): Promise<ViewerProfileUpdate> {
  const { data } = await apolloClient.mutate<
    UpdateViewerProfileMutationData,
    UpdateViewerProfileMutationVariables
  >({
    mutation: UPDATE_VIEWER_PROFILE_MUTATION,
    variables: { input },
  });

  if (
    data?.updateViewerProfile === null ||
    data?.updateViewerProfile === undefined
  ) {
    throw new Error('Profile update did not return a user');
  }

  return data.updateViewerProfile;
}

export async function updateReportState(
  id: string,
  state: ModerationReportState,
): Promise<ModerationReport> {
  const { data } = await apolloClient.mutate<
    UpdateReportStateMutationData,
    UpdateReportStateMutationVariables
  >({
    mutation: UPDATE_REPORT_STATE_MUTATION,
    variables: { input: { id, state } },
  });

  if (!data?.updateReportState) {
    throw new Error('Report state update did not return a report');
  }

  return data.updateReportState;
}

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

export async function createCollection(
  input: CreateCollectionInput,
): Promise<DashboardCollection> {
  const { data } = await apolloClient.mutate<
    CreateCollectionMutationData,
    CreateCollectionMutationVariables
  >({
    mutation: CREATE_COLLECTION_MUTATION,
    variables: { input },
  });

  if (!data?.createCollection) {
    throw new Error('Collection creation did not return a collection');
  }

  return data.createCollection;
}

export async function updateCollection(
  input: UpdateCollectionInput,
): Promise<DashboardCollection> {
  const { data } = await apolloClient.mutate<
    UpdateCollectionMutationData,
    UpdateCollectionMutationVariables
  >({
    mutation: UPDATE_COLLECTION_MUTATION,
    variables: { input },
  });

  if (!data?.updateCollection) {
    throw new Error('Collection update did not return a collection');
  }

  return data.updateCollection;
}

export async function createOrganization(
  input: CreateOrganizationInput,
): Promise<DashboardOrganization> {
  const { data } = await apolloClient.mutate<
    CreateOrganizationMutationData,
    CreateOrganizationMutationVariables
  >({
    mutation: CREATE_ORGANIZATION_MUTATION,
    variables: { input },
  });

  if (!data?.createOrganization) {
    throw new Error('Organization creation did not return an organization');
  }

  return data.createOrganization;
}

export async function updateOrganization(
  input: UpdateOrganizationInput,
): Promise<DashboardOrganization> {
  const { data } = await apolloClient.mutate<
    UpdateOrganizationMutationData,
    UpdateOrganizationMutationVariables
  >({
    mutation: UPDATE_ORGANIZATION_MUTATION,
    variables: { input },
  });

  if (!data?.updateOrganization) {
    throw new Error('Organization update did not return an organization');
  }

  return data.updateOrganization;
}

export async function addProjectToOrganization(
  organizationId: string,
  projectSlug: string,
): Promise<DashboardOrganization> {
  const { data } = await apolloClient.mutate<
    AddProjectToOrganizationMutationData,
    AddProjectToOrganizationMutationVariables
  >({
    mutation: ADD_PROJECT_TO_ORGANIZATION_MUTATION,
    variables: { input: { organizationId, projectSlug } },
  });

  if (!data?.addProjectToOrganization) {
    throw new Error('Organization update did not return an organization');
  }

  return data.addProjectToOrganization;
}

export async function removeProjectFromOrganization(
  organizationId: string,
  projectSlug: string,
): Promise<DashboardOrganization> {
  const { data } = await apolloClient.mutate<
    RemoveProjectFromOrganizationMutationData,
    RemoveProjectFromOrganizationMutationVariables
  >({
    mutation: REMOVE_PROJECT_FROM_ORGANIZATION_MUTATION,
    variables: { input: { organizationId, projectSlug } },
  });

  if (!data?.removeProjectFromOrganization) {
    throw new Error('Organization update did not return an organization');
  }

  return data.removeProjectFromOrganization;
}

export async function addProjectToCollection(
  collectionId: string,
  projectSlug: string,
): Promise<DashboardCollection> {
  const { data } = await apolloClient.mutate<
    AddProjectToCollectionMutationData,
    AddProjectToCollectionMutationVariables
  >({
    mutation: ADD_PROJECT_TO_COLLECTION_MUTATION,
    variables: { input: { collectionId, projectSlug } },
  });

  if (!data?.addProjectToCollection) {
    throw new Error('Collection update did not return a collection');
  }

  return data.addProjectToCollection;
}

export async function removeProjectFromCollection(
  collectionId: string,
  projectSlug: string,
): Promise<DashboardCollection> {
  const { data } = await apolloClient.mutate<
    RemoveProjectFromCollectionMutationData,
    RemoveProjectFromCollectionMutationVariables
  >({
    mutation: REMOVE_PROJECT_FROM_COLLECTION_MUTATION,
    variables: { input: { collectionId, projectSlug } },
  });

  if (!data?.removeProjectFromCollection) {
    throw new Error('Collection update did not return a collection');
  }

  return data.removeProjectFromCollection;
}

export async function createVersion(
  input: CreateVersionInput,
): Promise<DashboardVersion> {
  const { data } = await apolloClient.mutate<
    CreateVersionMutationData,
    CreateVersionMutationVariables
  >({
    mutation: CREATE_VERSION_MUTATION,
    variables: { input },
  });

  if (!data?.createVersion) {
    throw new Error('Version creation did not return a version');
  }

  return data.createVersion;
}

export async function updateVersion(
  input: UpdateVersionInput,
): Promise<DashboardVersion> {
  const { data } = await apolloClient.mutate<
    UpdateVersionMutationData,
    UpdateVersionMutationVariables
  >({
    mutation: UPDATE_VERSION_MUTATION,
    variables: { input },
  });

  if (!data?.updateVersion) {
    throw new Error('Version update did not return a version');
  }

  return data.updateVersion;
}

export async function updateVersionDependencies(
  input: UpdateVersionDependenciesInput,
): Promise<DashboardVersion> {
  const { data } = await apolloClient.mutate<
    UpdateVersionDependenciesMutationData,
    UpdateVersionDependenciesMutationVariables
  >({
    mutation: UPDATE_VERSION_DEPENDENCIES_MUTATION,
    variables: { input },
  });

  if (!data?.updateVersionDependencies) {
    throw new Error('Version dependencies did not return a version');
  }

  return data.updateVersionDependencies;
}

export function dashboardProjectToMod(project: DashboardProject): Mod {
  return {
    author: 'Moddery',
    categories: project.categories,
    client: 'optional',
    color: '#1d9bf0',
    description: project.summary,
    downloads: project.downloads,
    follows: project.followers,
    gameVersions: project.gameVersions,
    icon: project.iconUrl,
    loaders: project.loaders.map((loader) => loader.toLowerCase()),
    projectType: projectTypeFromKind(project.kind),
    server: 'optional',
    slug: project.slug,
    title: project.title,
    updated: project.updatedAt,
  };
}
