import {
  type CollectionVisibility,
  type DependencyKind,
  type ProjectKind,
} from '@moddery/shared';

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
  status: string;
  username: string;
}

export interface AdminUserAccount {
  avatarUrl: string | null;
  createdAt: string;
  displayName: string | null;
  id: string;
  role: string;
  status: string;
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
  license: {
    id: string;
    name: string;
    url: string | null;
  };
  links: DashboardProjectLink[];
  loaders: string[];
  slug: string;
  sourceUrl: string | null;
  status: string;
  summary: string;
  title: string;
  updatedAt: string;
  wikiUrl: string | null;
}

export interface DashboardProjectLink {
  kind: string;
  label: string | null;
  url: string;
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

export interface ApiTokenSummary {
  createdAt: string;
  expiresAt: string | null;
  id: string;
  lastUsedAt: string | null;
  name: string;
  revokedAt: string | null;
  scopes: string[];
}

export interface SessionSummary {
  createdAt: string;
  expiresAt: string;
  id: string;
  lastUsedAt: string;
  revokedAt: string | null;
  userAgent: string | null;
}

export interface CreatedApiToken {
  token: string;
  tokenSummary: ApiTokenSummary;
}

export interface NotificationPreference {
  channel: 'EMAIL' | 'IN_APP';
  enabled: boolean;
  type: string;
  updatedAt: string;
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

export interface ReportThread {
  createdAt: string;
  id: string;
  messages: ReportThreadMessage[];
  reportId: string | null;
  subject: string;
  updatedAt: string;
}
