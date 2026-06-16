export interface SearchProjectDocument {
  readonly categories: readonly string[];
  readonly description: string;
  readonly downloads: number;
  readonly followers: number;
  readonly gameVersions: readonly string[];
  readonly iconUrl: string | null;
  readonly id: string;
  readonly kind: string;
  readonly loaders: readonly string[];
  readonly slug: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly title: string;
  readonly updatedAt: string;
}
