import {
  type CategoryTaxonomy,
  type CreateProjectInput,
  type GameVersionTaxonomy,
} from '../../../../lib/dashboard.ts';

export interface PublishProjectFieldsProps {
  categories: string[];
  categoryOptions: CategoryTaxonomy[];
  color: string;
  description: string;
  gameVersionOptions: GameVersionTaxonomy[];
  gameVersions: string[];
  kind: CreateProjectInput['kind'];
  loaders: string[];
  slug: string;
  summary: string;
  title: string;
  onCategoriesChange: (value: string[]) => void;
  onColorChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onGameVersionsChange: (value: string[]) => void;
  onKindChange: (value: CreateProjectInput['kind']) => void;
  onLoadersChange: (value: string[]) => void;
  onSlugChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onTitleChange: (value: string) => void;
}
