import {
  type AccountRole,
  type AccountStatus,
  type CollectionVisibility,
  type DependencyKind,
  type ProjectKind,
  type ReportState,
} from '@moddery/shared';

export * from './types/account.js';

export interface DashboardData {
  authAccounts: DashboardAuthAccount[];
  avatarUrl: string | null;
  bio: string | null;
  collectionCount: number;
  collections: DashboardCollection[];
  displayName: string | null;
  email: string | null;
  emailVerifiedAt: string | null;
  followedProjectCount: number;
  id: string;
  isAdmin: boolean;
  newsletterOptIn: boolean;
  organizationCount: number;
  organizations: DashboardOrganization[];
  projectCount: number;
  projects: DashboardProject[];
  role: AccountRole;
  status: AccountStatus;
  twoFactorEnabled: boolean;
  username: string;
}

export interface DashboardAuthAccount {
  createdAt: string;
  id: string;
  provider: string;
}

export interface AdminUserAccount {
  avatarUrl: string | null;
  collectionCount: number;
  createdAt: string;
  displayName: string | null;
  email: string | null;
  emailVerifiedAt: string | null;
  id: string;
  newsletterOptIn: boolean;
  projectCount: number;
  role: AccountRole;
  status: AccountStatus;
  twoFactorEnabled: boolean;
  username: string;
}

export interface AdminUserSearchResult {
  totalHits: number;
  users: AdminUserAccount[];
}

export interface AdminAuditUser {
  displayName: string | null;
  id: string;
  username: string;
}

export interface UserAccountAuditSnapshot {
  role: AccountRole;
  status: AccountStatus;
}

export interface AdminAuditLog {
  action: string;
  actor: AdminAuditUser | null;
  actorId: string | null;
  after: UserAccountAuditSnapshot | null;
  before: UserAccountAuditSnapshot | null;
  createdAt: string;
  id: string;
  moderationAction: string | null;
  projectAfter: ProjectAuditSnapshot | null;
  projectBefore: ProjectAuditSnapshot | null;
  reason: string | null;
  resource: AuditResourceSnapshot | null;
  targetUser: AdminAuditUser | null;
  targetUserId: string | null;
  teamMemberAction: string | null;
  teamMemberAfter: TeamMemberAuditSnapshot | null;
  teamMemberBefore: TeamMemberAuditSnapshot | null;
}

export interface AuditResourceSnapshot {
  id: string;
  kind: 'ORGANIZATION' | 'PROJECT';
  name: string;
  projectKind: ProjectKind | null;
  slug: string;
}

export interface ProjectAuditSnapshot {
  id: string;
  projectKind: ProjectKind | null;
  requestedStatus: string | null;
  slug: string;
  status: string;
  title: string;
}

export interface TeamMemberAuditSnapshot {
  accepted: boolean;
  owner: boolean;
  permissions: string[];
  role: string;
  username: string;
}

export interface AdminAuditLogSearchResult {
  auditLogs: AdminAuditLog[];
  totalHits: number;
}

export interface DashboardCollection {
  color: string | null;
  description: string | null;
  iconUrl: string | null;
  id: string;
  items: DashboardCollectionItem[];
  name: string;
  projectCount: number;
  slug: string;
  updatedAt: string;
  visibility: CollectionVisibility;
}

export interface DashboardCollectionItem {
  createdAt: string;
  project: {
    iconUrl: string | null;
    kind: ProjectKind;
    slug: string;
    summary: string;
    title: string;
  };
  sortOrder: number;
}

export interface DashboardProject {
  approvedAt?: string | null;
  archivedAt?: string | null;
  body: string;
  color: string | null;
  categories: string[];
  discordUrl: string | null;
  downloads: number;
  followers: number;
  gallery: DashboardGalleryImage[];
  gameVersions: string[];
  iconUrl: string | null;
  issuesUrl: string | null;
  kind: ProjectKind;
  license: {
    id: string;
    name: string;
    url: string | null;
  };
  links: DashboardProjectLink[];
  loaders: string[];
  moderationLock: DashboardModerationLock | null;
  owner?: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  } | null;
  organization?: {
    color: string | null;
    iconUrl: string | null;
    id: string;
    name: string;
    slug: string;
  } | null;
  publishedAt?: string | null;
  queuedAt?: string | null;
  requestedStatus?: string | null;
  slug: string;
  sourceUrl: string | null;
  status: string;
  summary: string;
  title: string;
  updatedAt: string;
  wikiUrl: string | null;
}

export interface DashboardProjectSearchResult {
  projects: DashboardProject[];
  totalHits: number;
}

export interface DashboardModerationLock {
  createdAt: string;
  expiresAt: string;
  id: string;
  moderator: {
    displayName: string | null;
    id: string;
    username: string;
  };
}

export interface DashboardProjectLink {
  kind: string;
  label: string | null;
  url: string;
}

export interface DashboardProjectMember {
  accepted: boolean;
  owner: boolean;
  permissions: string[];
  role: string;
  sortOrder: number;
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
}

export interface CategoryTaxonomy {
  description: string | null;
  name: string;
  projectKind: ProjectKind | null;
  slug: string;
}

export interface GameVersionTaxonomy {
  isActive: boolean;
  version: string;
}

export interface LicenseTaxonomy {
  key: string;
  name: string;
  url: string | null;
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
  iconUrl: string | null;
  id: string;
  memberCount: number;
  members: DashboardOrganizationMember[];
  name: string;
  projectCount: number;
  slug: string;
  updatedAt: string;
}

export interface DashboardOrganizationMember {
  isOwner: boolean;
  permissions: string[];
  role: string;
  sortOrder: number;
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
}

export interface CreateProjectInput {
  categories: string[];
  color: string | null;
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
  iconUrl: string | null;
  name: string;
  slug: string;
  visibility: CollectionVisibility;
}

export interface UpdateCollectionInput {
  collectionId: string;
  color: string | null;
  description: string | null;
  iconUrl: string | null;
  name: string;
  slug: string;
  visibility: CollectionVisibility;
}

export interface CreateOrganizationInput {
  color: string | null;
  description: string | null;
  iconUrl: string | null;
  name: string;
  slug: string;
}

export interface UpdateOrganizationInput {
  color: string | null;
  description: string | null;
  iconUrl: string | null;
  name: string;
  organizationId: string;
  slug: string;
}

export interface AddOrganizationTeamMemberInput {
  organizationId: string;
  permissions: string[];
  role: string;
  username: string;
}

export interface RemoveOrganizationTeamMemberInput {
  organizationId: string;
  username: string;
}

export interface UpdateProjectInput {
  categories: string[];
  color: string | null;
  description: string;
  discordUrl: string | null;
  gameVersions: string[];
  iconUrl: string | null;
  issuesUrl: string | null;
  licenseKey: string;
  licenseName: string;
  licenseUrl: string | null;
  links: DashboardProjectLink[];
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
  email: string | null;
  newsletterOptIn: boolean;
}

export interface ViewerProfileUpdate {
  avatarUrl: string | null;
  bio: string | null;
  displayName: string | null;
  email: string | null;
  emailVerifiedAt: string | null;
  id: string;
  newsletterOptIn: boolean;
  twoFactorEnabled: boolean;
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

export interface PrepareProjectUploadInput {
  contentType: string | null;
  fileName: string;
  projectSlug: string;
  sizeBytes: number;
  uploadKind: 'gallery-image' | 'project-icon' | 'version-file';
}

export interface ProjectUploadTarget {
  bucket: string;
  expiresAt: string;
  key: string;
  method: 'PUT';
  objectUrl: string;
  uploadUrl: string;
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
    hashes: {
      algorithm: string;
      value: string;
    }[];
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
  featured: boolean;
  gameVersions: string[];
  id: string;
  loaders: string[];
  name: string;
  projectSlug: string;
  sortOrder: number;
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
  featured: boolean;
  gameVersions: string[];
  loaders: string[];
  name: string;
  sortOrder: number;
  versionId: string;
  versionNumber: string;
}

export interface ModerationReport {
  body: string;
  closedAt: string | null;
  createdAt: string;
  id: string;
  project: {
    id: string;
    kind: ProjectKind;
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
  version: {
    id: string;
    name: string;
    project: {
      id: string;
      kind: ProjectKind;
      slug: string;
      title: string;
    };
    versionNumber: string;
  } | null;
  versionId: string | null;
}

export interface ModerationReportSearchResult {
  reports: ModerationReport[];
  totalHits: number;
}

export type ModerationReportState = ReportState;

export interface ReportThreadMessage {
  author: {
    displayName: string | null;
    id: string;
    username: string;
  };
  body: string;
  createdAt: string;
  id: string;
}

export interface ReportThreadMember {
  createdAt: string;
  lastReadAt: string | null;
  user: {
    displayName: string | null;
    id: string;
    username: string;
  };
}

export interface ReportThread {
  createdAt: string;
  id: string;
  members: ReportThreadMember[];
  messages: ReportThreadMessage[];
  reportId: string | null;
  subject: string;
  updatedAt: string;
}

export type DirectThread = ReportThread;

export interface DirectThreadSearchResult {
  threads: DirectThread[];
  totalHits: number;
}
