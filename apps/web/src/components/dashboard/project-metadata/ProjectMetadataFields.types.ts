import {
  type CategoryTaxonomy,
  type DashboardProject,
  type GameVersionTaxonomy,
  type LicenseTaxonomy,
} from '../../../lib/dashboard.ts';

export interface ProjectMetadataFieldsProps {
  categories: string[];
  categoryOptions: CategoryTaxonomy[];
  color: string;
  description: string;
  discordUrl: string;
  extraLinks: string;
  gameVersionOptions: GameVersionTaxonomy[];
  gameVersions: string[];
  iconUrl: string;
  issuesUrl: string;
  licenseKey: string;
  licenseName: string;
  licenseUrl: string;
  licenses: LicenseTaxonomy[];
  loaders: string[];
  onCategoriesChange: (value: string[]) => void;
  onColorChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDiscordUrlChange: (value: string) => void;
  onExtraLinksChange: (value: string) => void;
  onGameVersionsChange: (value: string[]) => void;
  onIconUrlChange: (value: string) => void;
  onIconFileChange: (value: File | null) => void;
  onIssuesUrlChange: (value: string) => void;
  onLicenseKeyChange: (value: string) => void;
  onLicenseNameChange: (value: string) => void;
  onLicenseUrlChange: (value: string) => void;
  onLicenseSelect: (key: string) => void;
  onLoadersChange: (value: string[]) => void;
  onProjectChange: (value: string) => void;
  onSourceUrlChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onWikiUrlChange: (value: string) => void;
  projectSlug: string;
  projects: DashboardProject[];
  sourceUrl: string;
  summary: string;
  title: string;
  wikiUrl: string;
}
