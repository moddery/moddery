export interface SearchProjectDocument {
  readonly categories: readonly string[];
  readonly description: string;
  readonly downloads: number;
  readonly id: string;
  readonly kind: string;
  readonly loaders: readonly string[];
  readonly slug: string;
  readonly summary: string;
  readonly title: string;
}
