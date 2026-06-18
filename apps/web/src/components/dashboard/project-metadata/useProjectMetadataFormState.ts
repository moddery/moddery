import { useState } from 'react';

import {
  type DashboardProject,
  type LicenseTaxonomy,
  type UpdateProjectInput,
} from '../../../lib/dashboard.ts';
import { parseProjectLinks, projectLinksText } from './projectLinks.ts';
import { nullableText } from './shared.tsx';

export function useProjectMetadataFormState(
  projects: DashboardProject[],
  licenses: LicenseTaxonomy[],
) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const selectedProject =
    projects.find((item) => item.slug === projectSlug) ?? projects[0];
  const [title, setTitle] = useState(selectedProject?.title ?? '');
  const [summary, setSummary] = useState(selectedProject?.summary ?? '');
  const [description, setDescription] = useState(selectedProject?.body ?? '');
  const [color, setColor] = useState(selectedProject?.color ?? '');
  const [iconUrl, setIconUrl] = useState(selectedProject?.iconUrl ?? '');
  const [sourceUrl, setSourceUrl] = useState(selectedProject?.sourceUrl ?? '');
  const [issuesUrl, setIssuesUrl] = useState(selectedProject?.issuesUrl ?? '');
  const [wikiUrl, setWikiUrl] = useState(selectedProject?.wikiUrl ?? '');
  const [discordUrl, setDiscordUrl] = useState(
    selectedProject?.discordUrl ?? '',
  );
  const [licenseKey, setLicenseKey] = useState(
    selectedProject?.license.id ?? '',
  );
  const [licenseName, setLicenseName] = useState(
    selectedProject?.license.name ?? '',
  );
  const [licenseUrl, setLicenseUrl] = useState(
    selectedProject?.license.url ?? '',
  );
  const [extraLinks, setExtraLinks] = useState(
    projectLinksText(selectedProject),
  );
  const [loaders, setLoaders] = useState<string[]>(
    selectedProject?.loaders ?? [],
  );
  const [gameVersions, setGameVersions] = useState<string[]>(
    selectedProject?.gameVersions ?? [],
  );
  const [categories, setCategories] = useState<string[]>(
    selectedProject?.categories ?? [],
  );

  function selectProject(slug: string) {
    const nextProject = projects.find((item) => item.slug === slug);
    setProjectSlug(slug);
    setTitle(nextProject?.title ?? '');
    setSummary(nextProject?.summary ?? '');
    setDescription(nextProject?.body ?? '');
    setColor(nextProject?.color ?? '');
    setIconUrl(nextProject?.iconUrl ?? '');
    setSourceUrl(nextProject?.sourceUrl ?? '');
    setIssuesUrl(nextProject?.issuesUrl ?? '');
    setWikiUrl(nextProject?.wikiUrl ?? '');
    setDiscordUrl(nextProject?.discordUrl ?? '');
    setLicenseKey(nextProject?.license.id ?? '');
    setLicenseName(nextProject?.license.name ?? '');
    setLicenseUrl(nextProject?.license.url ?? '');
    setExtraLinks(projectLinksText(nextProject));
    setLoaders(nextProject?.loaders ?? []);
    setGameVersions(nextProject?.gameVersions ?? []);
    setCategories(nextProject?.categories ?? []);
  }

  function selectLicense(key: string) {
    const license = licenses.find((item) => item.key === key.trim());
    if (!license) return;

    setLicenseKey(license.key);
    setLicenseName(license.name);
    setLicenseUrl(license.url ?? '');
  }

  const fields = {
    categories,
    color,
    description,
    discordUrl,
    extraLinks,
    gameVersions,
    iconUrl,
    issuesUrl,
    licenseKey,
    licenseName,
    licenseUrl,
    licenses,
    loaders,
    projectSlug,
    projects,
    sourceUrl,
    summary,
    title,
    wikiUrl,
    onCategoriesChange: setCategories,
    onColorChange: setColor,
    onDescriptionChange: setDescription,
    onDiscordUrlChange: setDiscordUrl,
    onExtraLinksChange: setExtraLinks,
    onGameVersionsChange: setGameVersions,
    onIconUrlChange: setIconUrl,
    onIssuesUrlChange: setIssuesUrl,
    onLicenseKeyChange: setLicenseKey,
    onLicenseNameChange: setLicenseName,
    onLicenseUrlChange: setLicenseUrl,
    onLicenseSelect: selectLicense,
    onLoadersChange: setLoaders,
    onProjectChange: selectProject,
    onSourceUrlChange: setSourceUrl,
    onSummaryChange: setSummary,
    onTitleChange: setTitle,
    onWikiUrlChange: setWikiUrl,
  };

  function buildInput(): UpdateProjectInput {
    return {
      categories,
      color: nullableText(color),
      description,
      discordUrl: nullableText(discordUrl),
      gameVersions,
      iconUrl: nullableText(iconUrl),
      issuesUrl: nullableText(issuesUrl),
      licenseKey,
      licenseName,
      licenseUrl: nullableText(licenseUrl),
      links: parseProjectLinks(extraLinks),
      loaders,
      projectSlug,
      sourceUrl: nullableText(sourceUrl),
      summary,
      title,
      wikiUrl: nullableText(wikiUrl),
    };
  }

  return { buildInput, fields, selectProject };
}
