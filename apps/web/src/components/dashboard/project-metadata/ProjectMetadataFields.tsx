import { ProjectIdentityFields } from './fields/ProjectIdentityFields.tsx';
import { ProjectLicenseFields } from './fields/ProjectLicenseFields.tsx';
import { ProjectLinkFields } from './fields/ProjectLinkFields.tsx';
import { ProjectSelector } from './fields/ProjectSelector.tsx';
import { ProjectTaxonomyFields } from './fields/ProjectTaxonomyFields.tsx';
import { type ProjectMetadataFieldsProps } from './ProjectMetadataFields.types.ts';
import { DashboardTextarea } from './shared.tsx';

export function ProjectMetadataFields({
  categories,
  categoryOptions,
  color,
  description,
  disabled,
  discordUrl,
  extraLinks,
  gameVersionOptions,
  gameVersions,
  iconFile,
  issuesUrl,
  licenseKey,
  licenseName,
  licenseUrl,
  licenses,
  loaders,
  onCategoriesChange,
  onColorChange,
  onDescriptionChange,
  onDiscordUrlChange,
  onExtraLinksChange,
  onGameVersionsChange,
  onIconFileChange,
  onIssuesUrlChange,
  onLicenseKeyChange,
  onLicenseNameChange,
  onLicenseUrlChange,
  onLicenseSelect,
  onLoadersChange,
  onProjectChange,
  onSourceUrlChange,
  onSummaryChange,
  onTitleChange,
  onWikiUrlChange,
  projectSlug,
  projects,
  sourceUrl,
  summary,
  title,
  wikiUrl,
}: ProjectMetadataFieldsProps) {
  return (
    <>
      <ProjectSelector
        disabled={disabled}
        projectSlug={projectSlug}
        projects={projects}
        onProjectChange={onProjectChange}
      />
      <ProjectIdentityFields
        color={color}
        disabled={disabled}
        iconFile={iconFile}
        summary={summary}
        title={title}
        onColorChange={onColorChange}
        onIconFileChange={onIconFileChange}
        onSummaryChange={onSummaryChange}
        onTitleChange={onTitleChange}
      />
      <DashboardTextarea
        label="Description"
        disabled={disabled}
        value={description}
        onChange={onDescriptionChange}
        required
      />
      <ProjectTaxonomyFields
        categories={categories}
        categoryOptions={categoryOptions}
        disabled={disabled}
        gameVersionOptions={gameVersionOptions}
        gameVersions={gameVersions}
        loaders={loaders}
        onCategoriesChange={onCategoriesChange}
        onGameVersionsChange={onGameVersionsChange}
        onLoadersChange={onLoadersChange}
        projectSlug={projectSlug}
        projects={projects}
      />
      <ProjectLinkFields
        disabled={disabled}
        discordUrl={discordUrl}
        issuesUrl={issuesUrl}
        sourceUrl={sourceUrl}
        wikiUrl={wikiUrl}
        onDiscordUrlChange={onDiscordUrlChange}
        onIssuesUrlChange={onIssuesUrlChange}
        onSourceUrlChange={onSourceUrlChange}
        onWikiUrlChange={onWikiUrlChange}
      />
      <ProjectLicenseFields
        disabled={disabled}
        licenseKey={licenseKey}
        licenseName={licenseName}
        licenseUrl={licenseUrl}
        licenses={licenses}
        onLicenseKeyChange={onLicenseKeyChange}
        onLicenseNameChange={onLicenseNameChange}
        onLicenseUrlChange={onLicenseUrlChange}
        onLicenseSelect={onLicenseSelect}
      />
      <DashboardTextarea
        label="Extra links"
        disabled={disabled}
        value={extraLinks}
        onChange={onExtraLinksChange}
        placeholder="DONATION | Sponsor | https://example.test"
      />
    </>
  );
}
