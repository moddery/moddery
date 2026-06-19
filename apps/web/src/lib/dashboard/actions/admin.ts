import { type AccountRole, type AccountStatus } from '@moddery/shared';

import { apolloClient } from '../../../apollo.js';
import {
  ADMIN_AUDIT_LOG_SEARCH_QUERY,
  ADMIN_USER_SEARCH_QUERY,
  ADMIN_USERS_QUERY,
  UPDATE_USER_ACCOUNT_MUTATION,
  MODERATION_PROJECTS_QUERY,
  MODERATION_PROJECT_SEARCH_QUERY,
  MODERATE_PROJECT_MUTATION,
  MODERATION_REPORTS_QUERY,
  UPDATE_REPORT_STATE_MUTATION,
  REPORT_THREAD_QUERY,
  CREATE_REPORT_THREAD_MESSAGE_MUTATION,
  LOCK_PROJECT_FOR_MODERATION_MUTATION,
  RELEASE_PROJECT_MODERATION_LOCK_MUTATION,
  MODERATION_VERSION_SEARCH_QUERY,
  MODERATE_VERSION_MUTATION,
} from '../graphql.js';
import {
  type ModerationReportsQueryData,
  type ModerationReportsQueryVariables,
  type UpdateReportStateMutationData,
  type UpdateReportStateMutationVariables,
  type ReportThreadQueryData,
  type ReportThreadQueryVariables,
  type CreateReportThreadMessageMutationData,
  type CreateReportThreadMessageMutationVariables,
  type ModerationProjectSearchQueryData,
  type ModerationProjectSearchQueryVariables,
  type AdminAuditLogSearchQueryData,
  type AdminAuditLogSearchQueryVariables,
  type ModerationProjectsQueryData,
  type AdminUserSearchQueryData,
  type AdminUserSearchQueryVariables,
  type AdminUsersQueryData,
  type UpdateUserAccountMutationData,
  type UpdateUserAccountMutationVariables,
  type ModerateProjectMutationData,
  type ModerateProjectMutationVariables,
  type LockProjectForModerationMutationData,
  type ReleaseProjectModerationLockMutationData,
  type ProjectModerationLockMutationVariables,
  type ModerationVersionSearchQueryData,
  type ModerationVersionSearchQueryVariables,
  type ModerateVersionMutationData,
  type ModerateVersionMutationVariables,
} from '../internal-types.js';
import {
  type AdminUserAccount,
  type AdminAuditLogSearchResult,
  type AdminUserSearchResult,
  type DashboardProjectSearchResult,
  type DashboardProject,
  type DashboardVersion,
  type DashboardVersionSearchResult,
  type ModerationReport,
  type ModerationReportSearchResult,
  type ModerationReportState,
  type ReportThread,
} from '../types.js';

export async function fetchAdminAuditLogSearch(
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<AdminAuditLogSearchResult> {
  const { data } = await apolloClient.query<
    AdminAuditLogSearchQueryData,
    AdminAuditLogSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: ADMIN_AUDIT_LOG_SEARCH_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
    },
  });

  return data.adminAuditLogSearch;
}

export async function fetchModerationReports(
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<ModerationReportSearchResult> {
  const { data } = await apolloClient.query<
    ModerationReportsQueryData,
    ModerationReportsQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: MODERATION_REPORTS_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
    },
  });

  return data.moderationReportSearch;
}

export async function fetchModerationProjects(
  signal?: AbortSignal,
): Promise<DashboardProject[]> {
  const { data } = await apolloClient.query<ModerationProjectsQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: MODERATION_PROJECTS_QUERY,
  });

  return data.moderationProjects;
}

export async function fetchModerationProjectSearch(
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<DashboardProjectSearchResult> {
  const { data } = await apolloClient.query<
    ModerationProjectSearchQueryData,
    ModerationProjectSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: MODERATION_PROJECT_SEARCH_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
    },
  });

  return data.moderationProjectSearch;
}

export async function fetchModerationVersionSearch(
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<DashboardVersionSearchResult> {
  const { data } = await apolloClient.query<
    ModerationVersionSearchQueryData,
    ModerationVersionSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: MODERATION_VERSION_SEARCH_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
    },
  });

  return data.moderationVersionSearch;
}

export async function fetchAdminUsers(
  signal?: AbortSignal,
): Promise<AdminUserAccount[]> {
  const { data } = await apolloClient.query<AdminUsersQueryData>({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: ADMIN_USERS_QUERY,
  });

  return data.adminUsers;
}

export async function fetchAdminUserSearch(
  search: string | null,
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<AdminUserSearchResult> {
  const normalizedSearch = search?.trim() ?? '';
  const { data } = await apolloClient.query<
    AdminUserSearchQueryData,
    AdminUserSearchQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: ADMIN_USER_SEARCH_QUERY,
    variables: {
      limit,
      offset: Math.max(0, page - 1) * limit,
      search: normalizedSearch === '' ? null : normalizedSearch,
    },
  });

  return data.adminUserSearch;
}

export async function updateUserAccount(input: {
  role: AccountRole | null;
  status: AccountStatus | null;
  userId: string;
}): Promise<AdminUserAccount> {
  const { data } = await apolloClient.mutate<
    UpdateUserAccountMutationData,
    UpdateUserAccountMutationVariables
  >({
    mutation: UPDATE_USER_ACCOUNT_MUTATION,
    variables: { input },
  });

  if (!data?.updateUserAccount) {
    throw new Error('User account update did not return from the API');
  }

  return data.updateUserAccount;
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

export async function moderateProject(input: {
  action: string;
  projectSlug: string;
  reason: string | null;
}): Promise<DashboardProject> {
  const { data } = await apolloClient.mutate<
    ModerateProjectMutationData,
    ModerateProjectMutationVariables
  >({
    mutation: MODERATE_PROJECT_MUTATION,
    variables: { input },
  });

  if (!data?.moderateProject) {
    throw new Error('Project moderation did not return from the API');
  }

  return data.moderateProject;
}

export async function lockProjectForModeration(
  projectSlug: string,
): Promise<DashboardProject> {
  const { data } = await apolloClient.mutate<
    LockProjectForModerationMutationData,
    ProjectModerationLockMutationVariables
  >({
    mutation: LOCK_PROJECT_FOR_MODERATION_MUTATION,
    variables: { projectSlug },
  });

  if (!data?.lockProjectForModeration) {
    throw new Error('Project lock did not return from the API');
  }

  return data.lockProjectForModeration;
}

export async function releaseProjectModerationLock(
  projectSlug: string,
): Promise<DashboardProject> {
  const { data } = await apolloClient.mutate<
    ReleaseProjectModerationLockMutationData,
    ProjectModerationLockMutationVariables
  >({
    mutation: RELEASE_PROJECT_MODERATION_LOCK_MUTATION,
    variables: { projectSlug },
  });

  if (!data?.releaseProjectModerationLock) {
    throw new Error('Project lock release did not return from the API');
  }

  return data.releaseProjectModerationLock;
}

export async function moderateVersion(input: {
  action: string;
  reason: string | null;
  versionId: string;
}): Promise<DashboardVersion> {
  const { data } = await apolloClient.mutate<
    ModerateVersionMutationData,
    ModerateVersionMutationVariables
  >({
    mutation: MODERATE_VERSION_MUTATION,
    variables: { input },
  });

  if (!data?.moderateVersion) {
    throw new Error('Version moderation did not return from the API');
  }

  return data.moderateVersion;
}

export async function fetchReportThread(
  reportId: string,
  signal?: AbortSignal,
): Promise<ReportThread> {
  const { data } = await apolloClient.query<
    ReportThreadQueryData,
    ReportThreadQueryVariables
  >({
    context: { fetchOptions: { signal } },
    fetchPolicy: 'network-only',
    query: REPORT_THREAD_QUERY,
    variables: { reportId },
  });

  return data.reportThread;
}

export async function createReportThreadMessage({
  body,
  reportId,
}: {
  body: string;
  reportId: string;
}): Promise<ReportThread> {
  const { data } = await apolloClient.mutate<
    CreateReportThreadMessageMutationData,
    CreateReportThreadMessageMutationVariables
  >({
    mutation: CREATE_REPORT_THREAD_MESSAGE_MUTATION,
    variables: { input: { body, reportId } },
  });

  if (!data?.createReportThreadMessage) {
    throw new Error('Thread message did not return from the API');
  }

  return data.createReportThreadMessage;
}
