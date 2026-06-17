import { type CreateProjectInput } from '../../../../lib/dashboard.ts';

export interface PublishProjectFieldsProps {
  categories: string;
  color: string;
  description: string;
  gameVersions: string;
  kind: CreateProjectInput['kind'];
  loaders: string;
  slug: string;
  summary: string;
  title: string;
  onCategoriesChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onGameVersionsChange: (value: string) => void;
  onKindChange: (value: CreateProjectInput['kind']) => void;
  onLoadersChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onTitleChange: (value: string) => void;
}
