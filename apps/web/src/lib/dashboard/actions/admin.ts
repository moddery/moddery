import { apolloClient } from '../../../apollo.js';
import {
  ADMIN_USERS_QUERY,
  UPDATE_USER_ACCOUNT_MUTATION,
  MODERATION_PROJECTS_QUERY,
  MODERATE_PROJECT_MUTATION,
  MODERATION_REPORTS_QUERY,
  UPDATE_REPORT_STATE_MUTATION,
  REPORT_THREAD_QUERY,
  CREATE_REPORT_THREAD_MESSAGE_MUTATION,
} from '../graphql.js';
import {
  type ModerationReportsQueryData,
  type UpdateReportStateMutationData,
  type UpdateReportStateMutationVariables,
  type ReportThreadQueryData,
  type ReportThreadQueryVariables,
  type CreateReportThreadMessageMutationData,
  type CreateReportThreadMessageMutationVariables,
  type ModerationProjectsQueryData,
  type AdminUsersQueryData,
  type UpdateUserAccountMutationData,
  type UpdateUserAccountMutationVariables,
  type ModerateProjectMutationData,
  type ModerateProjectMutationVariables,
} from '../internal-types.js';
import {
  type AdminUserAccount,
  type DashboardProject,
  type ModerationReport,
  type ModerationReportState,
  type ReportThread,
} from '../types.js';

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

export async function updateUserAccount(input: {
  role: string | null;
  status: string | null;
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
