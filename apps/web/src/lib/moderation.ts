import { gql } from '@apollo/client';

import { apolloClient } from '../apollo.js';

export interface ModerationViewer {
  id: string;
  role: string;
  username: string;
}

export interface ModerationNote {
  author: {
    displayName: string | null;
    id: string;
    username: string;
  };
  body: string;
  createdAt: string;
  id: string;
  projectId: string | null;
  updatedAt: string;
  userId: string | null;
}

export interface ModerationNoteSearchResult {
  notes: ModerationNote[];
  totalHits: number;
}

export interface ModerationAction {
  createdAt: string;
  id: string;
  kind: string;
  moderator: {
    displayName: string | null;
    id: string;
    username: string;
  };
  projectId: string;
  reason: string | null;
}

export interface ModerationActionSearchResult {
  actions: ModerationAction[];
  totalHits: number;
}

interface ModerationViewerQueryData {
  me: ModerationViewer;
}

interface ProjectModerationActionsQueryData {
  projectModerationActions: ModerationAction[];
}

interface ProjectModerationActionSearchQueryData {
  projectModerationActionSearch: ModerationActionSearchResult;
}

interface ProjectModerationActionsQueryVariables {
  projectSlug: string;
}

interface ProjectModerationActionSearchQueryVariables {
  limit: number;
  offset: number;
  projectSlug: string;
}

interface ProjectModerationNotesQueryData {
  projectModerationNotes: ModerationNote[];
}

interface ProjectModerationNoteSearchQueryData {
  projectModerationNoteSearch: ModerationNoteSearchResult;
}

interface ProjectModerationNotesQueryVariables {
  projectSlug: string;
}

interface ModerationNoteSearchQueryVariables {
  limit: number;
  offset: number;
  projectSlug?: string;
  username?: string;
}

interface UserModerationNotesQueryData {
  userModerationNotes: ModerationNote[];
}

interface UserModerationNoteSearchQueryData {
  userModerationNoteSearch: ModerationNoteSearchResult;
}

interface UserModerationNotesQueryVariables {
  username: string;
}

interface CreateProjectModerationNoteMutationData {
  createProjectModerationNote: ModerationNote;
}

interface CreateProjectModerationNoteMutationVariables {
  input: {
    body: string;
    projectSlug: string;
  };
}

interface CreateUserModerationNoteMutationData {
  createUserModerationNote: ModerationNote;
}

interface CreateUserModerationNoteMutationVariables {
  input: {
    body: string;
    username: string;
  };
}

const NOTE_FIELDS = gql`
  fragment ModerationNoteFields on ModerationNoteSummary {
    author {
      displayName
      id
      username
    }
    body
    createdAt
    id
    projectId
    updatedAt
    userId
  }
`;

const ACTION_FIELDS = gql`
  fragment ModerationActionFields on ModerationActionSummary {
    createdAt
    id
    kind
    moderator {
      displayName
      id
      username
    }
    projectId
    reason
  }
`;

const MODERATION_VIEWER_QUERY = gql`
  query ModerationViewer {
    me {
      id
      role
      username
    }
  }
`;

const PROJECT_MODERATION_ACTIONS_QUERY = gql`
  ${ACTION_FIELDS}
  query ProjectModerationActions($projectSlug: String!) {
    projectModerationActions(projectSlug: $projectSlug) {
      ...ModerationActionFields
    }
  }
`;

const PROJECT_MODERATION_ACTION_SEARCH_QUERY = gql`
  ${ACTION_FIELDS}
  query ProjectModerationActionSearch(
    $projectSlug: String!
    $limit: Int!
    $offset: Int!
  ) {
    projectModerationActionSearch(
      projectSlug: $projectSlug
      limit: $limit
      offset: $offset
    ) {
      actions {
        ...ModerationActionFields
      }
      totalHits
    }
  }
`;

const PROJECT_MODERATION_NOTES_QUERY = gql`
  ${NOTE_FIELDS}
  query ProjectModerationNotes($projectSlug: String!) {
    projectModerationNotes(projectSlug: $projectSlug) {
      ...ModerationNoteFields
    }
  }
`;

const PROJECT_MODERATION_NOTE_SEARCH_QUERY = gql`
  ${NOTE_FIELDS}
  query ProjectModerationNoteSearch(
    $projectSlug: String!
    $limit: Int!
    $offset: Int!
  ) {
    projectModerationNoteSearch(
      projectSlug: $projectSlug
      limit: $limit
      offset: $offset
    ) {
      notes {
        ...ModerationNoteFields
      }
      totalHits
    }
  }
`;

const USER_MODERATION_NOTES_QUERY = gql`
  ${NOTE_FIELDS}
  query UserModerationNotes($username: String!) {
    userModerationNotes(username: $username) {
      ...ModerationNoteFields
    }
  }
`;

const USER_MODERATION_NOTE_SEARCH_QUERY = gql`
  ${NOTE_FIELDS}
  query UserModerationNoteSearch(
    $username: String!
    $limit: Int!
    $offset: Int!
  ) {
    userModerationNoteSearch(
      username: $username
      limit: $limit
      offset: $offset
    ) {
      notes {
        ...ModerationNoteFields
      }
      totalHits
    }
  }
`;

const CREATE_PROJECT_MODERATION_NOTE_MUTATION = gql`
  ${NOTE_FIELDS}
  mutation CreateProjectModerationNote(
    $input: CreateProjectModerationNoteInput!
  ) {
    createProjectModerationNote(input: $input) {
      ...ModerationNoteFields
    }
  }
`;

const CREATE_USER_MODERATION_NOTE_MUTATION = gql`
  ${NOTE_FIELDS}
  mutation CreateUserModerationNote($input: CreateUserModerationNoteInput!) {
    createUserModerationNote(input: $input) {
      ...ModerationNoteFields
    }
  }
`;

export async function fetchModerationViewer(
  signal?: AbortSignal,
): Promise<ModerationViewer> {
  const { data } = await apolloClient.query<ModerationViewerQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: MODERATION_VIEWER_QUERY,
  });

  return data.me;
}

export async function fetchProjectModerationActions(
  projectSlug: string,
  signal?: AbortSignal,
): Promise<ModerationAction[]> {
  const { data } = await apolloClient.query<
    ProjectModerationActionsQueryData,
    ProjectModerationActionsQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PROJECT_MODERATION_ACTIONS_QUERY,
    variables: { projectSlug },
  });

  return data.projectModerationActions;
}

export async function fetchProjectModerationActionSearch(
  projectSlug: string,
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<ModerationActionSearchResult> {
  const { data } = await apolloClient.query<
    ProjectModerationActionSearchQueryData,
    ProjectModerationActionSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PROJECT_MODERATION_ACTION_SEARCH_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
      projectSlug,
    },
  });

  return data.projectModerationActionSearch;
}

export async function fetchProjectModerationNotes(
  projectSlug: string,
  signal?: AbortSignal,
): Promise<ModerationNote[]> {
  const { data } = await apolloClient.query<
    ProjectModerationNotesQueryData,
    ProjectModerationNotesQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PROJECT_MODERATION_NOTES_QUERY,
    variables: { projectSlug },
  });

  return data.projectModerationNotes;
}

export async function fetchProjectModerationNoteSearch(
  projectSlug: string,
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<ModerationNoteSearchResult> {
  const { data } = await apolloClient.query<
    ProjectModerationNoteSearchQueryData,
    ModerationNoteSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: PROJECT_MODERATION_NOTE_SEARCH_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
      projectSlug,
    },
  });

  return data.projectModerationNoteSearch;
}

export async function fetchUserModerationNotes(
  username: string,
  signal?: AbortSignal,
): Promise<ModerationNote[]> {
  const { data } = await apolloClient.query<
    UserModerationNotesQueryData,
    UserModerationNotesQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: USER_MODERATION_NOTES_QUERY,
    variables: { username },
  });

  return data.userModerationNotes;
}

export async function fetchUserModerationNoteSearch(
  username: string,
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<ModerationNoteSearchResult> {
  const { data } = await apolloClient.query<
    UserModerationNoteSearchQueryData,
    ModerationNoteSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: USER_MODERATION_NOTE_SEARCH_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
      username,
    },
  });

  return data.userModerationNoteSearch;
}

export async function createProjectModerationNote(input: {
  body: string;
  projectSlug: string;
}): Promise<ModerationNote> {
  const { data } = await apolloClient.mutate<
    CreateProjectModerationNoteMutationData,
    CreateProjectModerationNoteMutationVariables
  >({
    mutation: CREATE_PROJECT_MODERATION_NOTE_MUTATION,
    variables: { input },
  });

  if (!data?.createProjectModerationNote) {
    throw new Error('Moderation note did not return from the API');
  }

  return data.createProjectModerationNote;
}

export async function createUserModerationNote(input: {
  body: string;
  username: string;
}): Promise<ModerationNote> {
  const { data } = await apolloClient.mutate<
    CreateUserModerationNoteMutationData,
    CreateUserModerationNoteMutationVariables
  >({
    mutation: CREATE_USER_MODERATION_NOTE_MUTATION,
    variables: { input },
  });

  if (!data?.createUserModerationNote) {
    throw new Error('Moderation note did not return from the API');
  }

  return data.createUserModerationNote;
}

export function canUseModerationNotes(
  viewer: ModerationViewer | undefined,
): boolean {
  return viewer?.role === 'ADMIN' || viewer?.role === 'MODERATOR';
}
