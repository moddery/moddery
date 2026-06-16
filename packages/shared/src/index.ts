export type AccountRole = 'USER' | 'MODERATOR' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type CollectionVisibility = 'PRIVATE' | 'UNLISTED' | 'PUBLIC';
export type DependencyKind =
  | 'REQUIRED'
  | 'OPTIONAL'
  | 'INCOMPATIBLE'
  | 'EMBEDDED';
export type FileKind = 'UNIVERSAL' | 'CLIENT' | 'SERVER';
export type ProjectKind =
  | 'MOD'
  | 'MODPACK'
  | 'RESOURCE_PACK'
  | 'SHADER'
  | 'PLUGIN'
  | 'DATAPACK';
export type ProjectStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED';
export type ReportReason =
  | 'SPAM'
  | 'MALWARE'
  | 'COPYRIGHT'
  | 'IMPERSONATION'
  | 'HATEFUL_OR_ABUSIVE'
  | 'BROKEN_OR_MISLEADING'
  | 'OTHER';
export type ReportState = 'OPEN' | 'TRIAGED' | 'CLOSED';
export type VersionChannel = 'ALPHA' | 'BETA' | 'RELEASE';
export type VersionStatus = ProjectStatus;

export type ModLoader = 'fabric' | 'forge' | 'neoforge' | 'quilt';
export type ProjectSort = 'newest' | 'updated' | 'downloads' | 'relevance';

export const SUPPORTED_GAME_VERSIONS = ['1.21.6', '1.21.5', '1.20.1'] as const;

export const SUPPORTED_LOADERS = [
  'fabric',
  'forge',
  'neoforge',
  'quilt',
] as const satisfies readonly ModLoader[];

export const PROJECT_KINDS = [
  'MOD',
  'MODPACK',
  'RESOURCE_PACK',
  'SHADER',
  'PLUGIN',
  'DATAPACK',
] as const satisfies readonly ProjectKind[];

export const VERSION_CHANNELS = [
  'ALPHA',
  'BETA',
  'RELEASE',
] as const satisfies readonly VersionChannel[];

export interface ProjectSummaryContract {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly kind: ProjectKind;
  readonly status: ProjectStatus;
  readonly downloads: number;
  readonly updatedAt: string;
}

export interface CatalogQueryContract {
  readonly search?: string;
  readonly loader?: ModLoader;
  readonly gameVersion?: (typeof SUPPORTED_GAME_VERSIONS)[number];
  readonly sort?: ProjectSort;
}
