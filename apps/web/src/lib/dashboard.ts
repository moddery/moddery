import { gql } from '@apollo/client';
import { type CollectionVisibility, type ProjectKind } from '@moddery/shared';

import { apolloClient } from '../apollo.js';
import { type Mod } from '../types.js';
import { projectTypeFromKind } from './projectTypes.js';

export interface DashboardData {
  collectionCount: number;
  collections: DashboardCollection[];
  displayName: string | null;
  followedProjectCount: number;
  id: string;
  isAdmin: boolean;
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
}

export interface DashboardProject {
  categories: string[];
  downloads: number;
  followers: number;
  gameVersions: string[];
  iconUrl: string | null;
  kind: ProjectKind;
  loaders: string[];
  slug: string;
  summary: string;
  title: string;
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
  id: string;
  name: string;
  projectSlug: string;
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
  userTargetId: string | null;
  versionId: string | null;
}

export type ModerationReportState = 'OPEN' | 'TRIAGED' | 'CLOSED';

interface DashboardQueryData {
  viewer: DashboardData | null;
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

interface CreateCollectionMutationData {
  createCollection: DashboardCollection;
}

interface CreateCollectionMutationVariables {
  input: CreateCollectionInput;
}

interface AddProjectToCollectionMutationData {
  addProjectToCollection: DashboardCollection;
}

interface AddProjectToCollectionMutationVariables {
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

const DASHBOARD_QUERY = gql`
  query Dashboard {
    viewer {
      collectionCount
      collections {
        color
        description
        id
        name
        projectCount
        slug
        updatedAt
      }
      displayName
      followedProjectCount
      id
      isAdmin
      projectCount
      projects {
        categories
        downloads
        followers
        gameVersions
        iconUrl
        kind
        loaders
        slug
        summary
        title
        updatedAt
      }
      role
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
      userTargetId
      versionId
    }
  }
`;

const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      categories
      downloads
      followers
      gameVersions
      iconUrl
      kind
      loaders
      slug
      summary
      title
      updatedAt
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

const CREATE_VERSION_MUTATION = gql`
  mutation CreateVersion($input: CreateVersionInput!) {
    createVersion(input: $input) {
      id
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

  return data.viewer;
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
