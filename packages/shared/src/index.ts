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

const PLATFORM_CATEGORY_TAGS = new Set([
  'babric',
  'bukkit',
  'canvas',
  'fabric',
  'folia',
  'forge',
  'iris',
  'liteloader',
  'minecraft',
  'neoforge',
  'optifine',
  'paper',
  'purpur',
  'quilt',
  'rift',
  'spigot',
  'sponge',
  'velocity',
  'waterfall',
]);

export function isProjectCategoryTag(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized !== '' &&
    !PLATFORM_CATEGORY_TAGS.has(normalized) &&
    !isGameVersionTag(normalized)
  );
}

export function isGameVersionTag(value: string): boolean {
  return /^(?:\d+\.\d+(?:\.\d+)?(?:[-+][a-z0-9._-]+)?|\d{2}w\d{2}[a-z]|b\d+\.\d+(?:\.\d+)?|rd-\d+|inf-\d+|[a-z0-9._-]*snapshot[a-z0-9._-]*)$/i.test(
    value,
  );
}

export const VERSION_CHANNELS = [
  'ALPHA',
  'BETA',
  'RELEASE',
] as const satisfies readonly VersionChannel[];

export interface ProjectSummaryContract {
  readonly body: string;
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly kind: ProjectKind;
  readonly status: ProjectStatus;
  readonly categories: readonly string[];
  readonly downloads: number;
  readonly followers: number;
  readonly gameVersions: readonly string[];
  readonly iconUrl?: string | null;
  readonly loaders: readonly string[];
  readonly gallery: readonly ProjectGalleryImageContract[];
  readonly updatedAt: string;
}

export interface ProjectGalleryImageContract {
  readonly createdAt: string;
  readonly description?: string | null;
  readonly displayUrl: string;
  readonly featured: boolean;
  readonly rawUrl: string;
  readonly sortOrder: number;
  readonly title?: string | null;
}

export interface CatalogQueryContract {
  readonly search?: string;
  readonly loader?: ModLoader;
  readonly gameVersion?: (typeof SUPPORTED_GAME_VERSIONS)[number];
  readonly sort?: ProjectSort;
}
