import {
  type AccountRole,
  type AccountStatus,
  type ProjectKind,
} from '@moddery/shared';
import {
  type AddProjectGalleryImageInput,
  type AddOrganizationTeamMemberInput,
  type AddProjectTeamMemberInput,
  type AdminAuditLogSearchResult,
  type AdminUserAccount,
  type AdminUserSearchResult,
  type CategoryTaxonomy,
  type CreateCollectionInput,
  type CreateOrganizationInput,
  type CreateProjectInput,
  type CreateVersionInput,
  type DashboardCollection,
  type DashboardData,
  type DashboardOrganization,
  type DashboardProject,
  type DashboardProjectSearchResult,
  type DashboardProjectMember,
  type DashboardVersion,
  type DashboardVersionSearchResult,
  type GameVersionTaxonomy,
  type LicenseTaxonomy,
  type ModerationReport,
  type ModerationReportSearchResult,
  type ModerationReportState,
  type PrepareProjectUploadInput,
  type ProjectUploadTarget,
  type RemoveProjectGalleryImageInput,
  type RemoveOrganizationTeamMemberInput,
  type RemoveProjectTeamMemberInput,
  type ReportThread,
  type UpdateCollectionInput,
  type UpdateCollectionProjectInput,
  type UpdateOrganizationInput,
  type UpdateProjectGalleryImageInput,
  type UpdateProjectInput,
  type UpdateVersionDependenciesInput,
  type UpdateVersionInput,
  type UpdateViewerProfileInput,
  type ViewerProfileUpdate,
} from './types.js';

export * from './internal-types/account.js';

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
  moderationReportSearch: ModerationReportSearchResult;
}

export interface ModerationReportsQueryVariables {
  limit: number;
  offset: number;
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

export interface CreateProjectMutationData {
  createProject: DashboardProject;
}

export interface CreateProjectMutationVariables {
  input: CreateProjectInput;
}

export interface AddProjectGalleryImageMutationData {
  addProjectGalleryImage: DashboardProject;
}

export interface RemoveProjectGalleryImageMutationData {
  removeProjectGalleryImage: DashboardProject;
}

export interface UpdateProjectGalleryImageMutationData {
  updateProjectGalleryImage: DashboardProject;
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

export interface RemoveProjectGalleryImageMutationVariables {
  input: RemoveProjectGalleryImageInput;
}

export interface UpdateProjectGalleryImageMutationVariables {
  input: UpdateProjectGalleryImageInput;
}

export interface AddProjectTeamMemberMutationVariables {
  input: AddProjectTeamMemberInput;
}

export interface PrepareProjectUploadMutationData {
  prepareProjectUpload: ProjectUploadTarget;
}

export interface PrepareProjectUploadMutationVariables {
  input: PrepareProjectUploadInput;
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

export interface UpdateCollectionProjectMutationData {
  updateCollectionProject: DashboardCollection;
}

export interface UpdateCollectionProjectMutationVariables {
  input: UpdateCollectionProjectInput;
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

export interface ViewerProjectVersionSearchQueryData {
  viewerProjectVersionSearch: DashboardVersionSearchResult;
}

export interface ViewerProjectVersionSearchQueryVariables {
  limit: number;
  offset: number;
  projectSlug: string;
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

export interface ModerationProjectSearchQueryData {
  moderationProjectSearch: DashboardProjectSearchResult;
}

export interface ModerationProjectSearchQueryVariables {
  limit: number;
  offset: number;
}

export interface AdminUsersQueryData {
  adminUsers: AdminUserAccount[];
}

export interface AdminUserSearchQueryData {
  adminUserSearch: AdminUserSearchResult;
}

export interface AdminUserSearchQueryVariables {
  limit: number;
  offset: number;
  search?: string | null;
}

export interface AdminAuditLogSearchQueryData {
  adminAuditLogSearch: AdminAuditLogSearchResult;
}

export interface AdminAuditLogSearchQueryVariables {
  limit: number;
  offset: number;
}

export interface UpdateUserAccountMutationData {
  updateUserAccount: AdminUserAccount;
}

export interface UpdateUserAccountMutationVariables {
  input: {
    role: AccountRole | null;
    status: AccountStatus | null;
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
