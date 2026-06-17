import { ProjectIdentityFields } from './fields/ProjectIdentityFields.tsx';
import { ProjectLicenseFields } from './fields/ProjectLicenseFields.tsx';
import { ProjectLinkFields } from './fields/ProjectLinkFields.tsx';
import { ProjectSelector } from './fields/ProjectSelector.tsx';
import { ProjectTaxonomyFields } from './fields/ProjectTaxonomyFields.tsx';
import { type ProjectMetadataFieldsProps } from './ProjectMetadataFields.types.ts';
import { DashboardTextarea } from './shared.tsx';

export function ProjectMetadataFields({
  categories,
  description,
  discordUrl,
  extraLinks,
  gameVersions,
  iconUrl,
  issuesUrl,
  licenseKey,
  licenseName,
  licenseUrl,
  loaders,
  onCategoriesChange,
  onDescriptionChange,
  onDiscordUrlChange,
  onExtraLinksChange,
  onGameVersionsChange,
  onIconUrlChange,
  onIssuesUrlChange,
  onLicenseKeyChange,
  onLicenseNameChange,
  onLicenseUrlChange,
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
        projectSlug={projectSlug}
        projects={projects}
        onProjectChange={onProjectChange}
      />
      <ProjectIdentityFields
        iconUrl={iconUrl}
        summary={summary}
        title={title}
        onIconUrlChange={onIconUrlChange}
        onSummaryChange={onSummaryChange}
        onTitleChange={onTitleChange}
      />
      <DashboardTextarea
        label="Description"
        value={description}
        onChange={onDescriptionChange}
        required
      />
      <ProjectTaxonomyFields
        categories={categories}
        gameVersions={gameVersions}
        loaders={loaders}
        onCategoriesChange={onCategoriesChange}
        onGameVersionsChange={onGameVersionsChange}
        onLoadersChange={onLoadersChange}
      />
      <ProjectLinkFields
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
        licenseKey={licenseKey}
        licenseName={licenseName}
        licenseUrl={licenseUrl}
        onLicenseKeyChange={onLicenseKeyChange}
        onLicenseNameChange={onLicenseNameChange}
        onLicenseUrlChange={onLicenseUrlChange}
      />
      <DashboardTextarea
        label="Extra links"
        value={extraLinks}
        onChange={onExtraLinksChange}
        placeholder="DONATION | Sponsor | https://example.test"
      />
    </>
  );
}
