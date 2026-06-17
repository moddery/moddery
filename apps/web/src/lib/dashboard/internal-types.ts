import { type ProjectKind } from '@moddery/shared';
import {
  type AddProjectGalleryImageInput,
  type AddOrganizationTeamMemberInput,
  type AddProjectTeamMemberInput,
  type AdminUserAccount,
  type ApiTokenSummary,
  type CategoryTaxonomy,
  type CreateCollectionInput,
  type CreateOrganizationInput,
  type CreateProjectInput,
  type CreatedApiToken,
  type CreatedOAuthClient,
  type CreateVersionInput,
  type DashboardCollection,
  type DashboardData,
  type DashboardOrganization,
  type DashboardProject,
  type DashboardProjectMember,
  type DashboardVersion,
  type DirectThread,
  type GameVersionTaxonomy,
  type LicenseTaxonomy,
  type ModerationReport,
  type ModerationReportState,
  type NotificationPreference,
  type OAuthClientSummary,
  type RemoveOrganizationTeamMemberInput,
  type RemoveProjectTeamMemberInput,
  type ReportThread,
  type SessionSummary,
  type TeamInvitationSummary,
  type UpdateCollectionInput,
  type UpdateOrganizationInput,
  type UpdateProjectInput,
  type UpdateVersionDependenciesInput,
  type UpdateVersionInput,
  type UpdateViewerProfileInput,
  type ViewerProfileUpdate,
} from './types.js';

export interface DashboardQueryData {
  viewer: DashboardData | null;
  viewerOrganizations: DashboardOrganization[];
}

export interface UpdateViewerProfileMutationData {
  updateViewerProfile: ViewerProfileUpdate | null;
}

export interface UpdateViewerProfileMutationVariables {
  input: UpdateViewerProfileInput;
}

export interface ModerationReportsQueryData {
  moderationReports: ModerationReport[];
}

export interface UpdateReportStateMutationData {
  updateReportState: ModerationReport;
}

export interface UpdateReportStateMutationVariables {
  input: {
    id: string;
    state: ModerationReportState;
  };
}

export interface ReportThreadQueryData {
  reportThread: ReportThread;
}

export interface ReportThreadQueryVariables {
  reportId: string;
}

export interface CreateReportThreadMessageMutationData {
  createReportThreadMessage: ReportThread;
}

export interface CreateReportThreadMessageMutationVariables {
  input: {
    body: string;
    reportId: string;
  };
}

export interface ViewerDirectThreadsQueryData {
  viewerDirectThreads: DirectThread[];
}

export interface CreateDirectThreadMutationData {
  createDirectThread: DirectThread;
}

export interface CreateDirectThreadMutationVariables {
  input: {
    body: string;
    username: string;
  };
}

export interface CreateDirectThreadMessageMutationData {
  createDirectThreadMessage: DirectThread;
}

export interface CreateDirectThreadMessageMutationVariables {
  input: {
    body: string;
    threadId: string;
  };
}

export interface ViewerApiTokensQueryData {
  viewerApiTokens: ApiTokenSummary[];
}

export interface ViewerSecurityQueryVariables {
  includeRevoked?: boolean | null;
}

export interface ViewerSessionsQueryData {
  viewerSessions: SessionSummary[];
}

export interface CreateApiTokenMutationData {
  createApiToken: CreatedApiToken;
}

export interface CreateApiTokenMutationVariables {
  input: {
    expiresInDays: number | null;
    name: string;
    scopes: string[];
  };
}

export interface RevokeApiTokenMutationData {
  revokeApiToken: ApiTokenSummary;
}

export interface RevokeApiTokenMutationVariables {
  tokenId: string;
}

export interface RevokeSessionMutationData {
  revokeSession: SessionSummary;
}

export interface RevokeSessionMutationVariables {
  sessionId: string;
}

export interface ViewerOAuthClientsQueryData {
  viewerOAuthClients: OAuthClientSummary[];
}

export interface CreateOAuthClientMutationData {
  createOAuthClient: CreatedOAuthClient;
}

export interface CreateOAuthClientMutationVariables {
  input: {
    description: string | null;
    homepageUrl: string | null;
    name: string;
    redirectUris: string[];
    scopes: string[] | null;
  };
}

export interface RevokeOAuthClientMutationData {
  revokeOAuthClient: OAuthClientSummary;
}

export interface RevokeOAuthClientMutationVariables {
  clientId: string;
}

export interface ViewerTeamInvitationsQueryData {
  viewerTeamInvitations: TeamInvitationSummary[];
}

export interface AcceptTeamInvitationMutationData {
  acceptTeamInvitation: TeamInvitationSummary;
}

export interface DeclineTeamInvitationMutationData {
  declineTeamInvitation: TeamInvitationSummary;
}

export interface TeamInvitationMutationVariables {
  invitationId: string;
}

export interface NotificationPreferencesQueryData {
  viewerNotificationPreferences: NotificationPreference[];
}

export interface CategoryTaxonomyQueryData {
  categories: CategoryTaxonomy[];
}

export interface GameVersionTaxonomyQueryData {
  gameVersions: GameVersionTaxonomy[];
}

export interface LicenseTaxonomyQueryData {
  licenses: LicenseTaxonomy[];
}

export interface UpsertCategoryMutationData {
  upsertCategory: CategoryTaxonomy;
}

export interface UpsertCategoryMutationVariables {
  input: {
    description: string | null;
    name: string;
    projectKind: ProjectKind | null;
    slug: string;
  };
}

export interface UpsertGameVersionMutationData {
  upsertGameVersion: GameVersionTaxonomy;
}

export interface UpsertGameVersionMutationVariables {
  input: {
    isActive: boolean;
    version: string;
  };
}

export interface UpsertLicenseMutationData {
  upsertLicense: LicenseTaxonomy;
}

export interface UpsertLicenseMutationVariables {
  input: {
    key: string;
    name: string;
    url: string | null;
  };
}

export interface UpdateNotificationPreferenceMutationData {
  updateNotificationPreference: NotificationPreference;
}

export interface SendNotificationMutationData {
  sendNotification: {
    actionUrl: string | null;
    body: string | null;
    createdAt: string;
    id: string;
    readAt: string | null;
    state: string;
    title: string;
    type: string;
  };
}

export interface SendNotificationMutationVariables {
  input: {
    actionUrl: string | null;
    body: string | null;
    title: string;
    type: string;
    username: string;
  };
}

export interface UpdateNotificationPreferenceMutationVariables {
  input: {
    channel: string;
    enabled: boolean;
    type: string;
  };
}

export interface CreateProjectMutationData {
  createProject: DashboardProject;
}

export interface CreateProjectMutationVariables {
  input: CreateProjectInput;
}

export interface AddProjectGalleryImageMutationData {
  addProjectGalleryImage: DashboardProject;
}

export interface AddProjectTeamMemberMutationData {
  addProjectTeamMember: DashboardProjectMember[];
}

export interface RemoveProjectTeamMemberMutationData {
  removeProjectTeamMember: DashboardProjectMember[];
}

export interface AddProjectGalleryImageMutationVariables {
  input: AddProjectGalleryImageInput;
}

export interface AddProjectTeamMemberMutationVariables {
  input: AddProjectTeamMemberInput;
}

export interface RemoveProjectTeamMemberMutationVariables {
  input: RemoveProjectTeamMemberInput;
}

export interface UpdateProjectMutationData {
  updateProject: DashboardProject;
}

export interface UpdateProjectMutationVariables {
  input: UpdateProjectInput;
}

export interface CreateCollectionMutationData {
  createCollection: DashboardCollection;
}

export interface CreateCollectionMutationVariables {
  input: CreateCollectionInput;
}

export interface UpdateCollectionMutationData {
  updateCollection: DashboardCollection;
}

export interface UpdateCollectionMutationVariables {
  input: UpdateCollectionInput;
}

export interface CreateOrganizationMutationData {
  createOrganization: DashboardOrganization;
}

export interface CreateOrganizationMutationVariables {
  input: CreateOrganizationInput;
}

export interface UpdateOrganizationMutationData {
  updateOrganization: DashboardOrganization;
}

export interface UpdateOrganizationMutationVariables {
  input: UpdateOrganizationInput;
}

export interface AddProjectToOrganizationMutationData {
  addProjectToOrganization: DashboardOrganization;
}

export interface RemoveProjectFromOrganizationMutationData {
  removeProjectFromOrganization: DashboardOrganization;
}

export interface AddOrganizationTeamMemberMutationData {
  addOrganizationTeamMember: DashboardOrganization;
}

export interface RemoveOrganizationTeamMemberMutationData {
  removeOrganizationTeamMember: DashboardOrganization;
}

export interface AddProjectToOrganizationMutationVariables {
  input: {
    organizationId: string;
    projectSlug: string;
  };
}

export interface RemoveProjectFromOrganizationMutationVariables {
  input: {
    organizationId: string;
    projectSlug: string;
  };
}

export interface AddOrganizationTeamMemberMutationVariables {
  input: AddOrganizationTeamMemberInput;
}

export interface RemoveOrganizationTeamMemberMutationVariables {
  input: RemoveOrganizationTeamMemberInput;
}

export interface AddProjectToCollectionMutationData {
  addProjectToCollection: DashboardCollection;
}

export interface RemoveProjectFromCollectionMutationData {
  removeProjectFromCollection: DashboardCollection;
}

export interface AddProjectToCollectionMutationVariables {
  input: {
    collectionId: string;
    projectSlug: string;
  };
}

export interface RemoveProjectFromCollectionMutationVariables {
  input: {
    collectionId: string;
    projectSlug: string;
  };
}

export interface CreateVersionMutationData {
  createVersion: DashboardVersion;
}

export interface CreateVersionMutationVariables {
  input: CreateVersionInput;
}

export interface UpdateVersionMutationData {
  updateVersion: DashboardVersion;
}

export interface UpdateVersionMutationVariables {
  input: UpdateVersionInput;
}

export interface UpdateVersionDependenciesMutationData {
  updateVersionDependencies: DashboardVersion;
}

export interface RecordFileScanMutationData {
  recordFileScan: DashboardVersion;
}

export interface RecordFileScanMutationVariables {
  input: {
    details: string | null;
    fileId: string;
    status: string;
    verdict: string | null;
  };
}

export interface UpdateVersionDependenciesMutationVariables {
  input: UpdateVersionDependenciesInput;
}

export interface ModerationProjectsQueryData {
  moderationProjects: DashboardProject[];
}

export interface AdminUsersQueryData {
  adminUsers: AdminUserAccount[];
}

export interface UpdateUserAccountMutationData {
  updateUserAccount: AdminUserAccount;
}

export interface UpdateUserAccountMutationVariables {
  input: {
    role: string | null;
    status: string | null;
    userId: string;
  };
}

export interface ModerateProjectMutationData {
  moderateProject: DashboardProject;
}

export interface LockProjectForModerationMutationData {
  lockProjectForModeration: DashboardProject;
}

export interface ReleaseProjectModerationLockMutationData {
  releaseProjectModerationLock: DashboardProject;
}

export interface ModerateProjectMutationVariables {
  input: {
    action: string;
    projectSlug: string;
    reason: string | null;
  };
}

export interface ProjectModerationLockMutationVariables {
  projectSlug: string;
}
