import { useState } from 'react';

import {
  type DashboardProject,
  type UpdateProjectInput,
} from '../../../lib/dashboard.ts';
import { parseProjectLinks, projectLinksText } from './projectLinks.ts';
import { nullableText, splitList } from './shared.tsx';

export function useProjectMetadataFormState(projects: DashboardProject[]) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const selectedProject =
    projects.find((item) => item.slug === projectSlug) ?? projects[0];
  const [title, setTitle] = useState(selectedProject?.title ?? '');
  const [summary, setSummary] = useState(selectedProject?.summary ?? '');
  const [description, setDescription] = useState(selectedProject?.body ?? '');
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
  const [loaders, setLoaders] = useState(
    selectedProject?.loaders.join(', ') ?? '',
  );
  const [gameVersions, setGameVersions] = useState(
    selectedProject?.gameVersions.join(', ') ?? '',
  );
  const [categories, setCategories] = useState(
    selectedProject?.categories.join(', ') ?? '',
  );

  function selectProject(slug: string) {
    const nextProject = projects.find((item) => item.slug === slug);
    setProjectSlug(slug);
    setTitle(nextProject?.title ?? '');
    setSummary(nextProject?.summary ?? '');
    setDescription(nextProject?.body ?? '');
    setIconUrl(nextProject?.iconUrl ?? '');
    setSourceUrl(nextProject?.sourceUrl ?? '');
    setIssuesUrl(nextProject?.issuesUrl ?? '');
    setWikiUrl(nextProject?.wikiUrl ?? '');
    setDiscordUrl(nextProject?.discordUrl ?? '');
    setLicenseKey(nextProject?.license.id ?? '');
    setLicenseName(nextProject?.license.name ?? '');
    setLicenseUrl(nextProject?.license.url ?? '');
    setExtraLinks(projectLinksText(nextProject));
    setLoaders(nextProject?.loaders.join(', ') ?? '');
    setGameVersions(nextProject?.gameVersions.join(', ') ?? '');
    setCategories(nextProject?.categories.join(', ') ?? '');
  }

  const fields = {
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
    projectSlug,
    projects,
    sourceUrl,
    summary,
    title,
    wikiUrl,
    onCategoriesChange: setCategories,
    onDescriptionChange: setDescription,
    onDiscordUrlChange: setDiscordUrl,
    onExtraLinksChange: setExtraLinks,
    onGameVersionsChange: setGameVersions,
    onIconUrlChange: setIconUrl,
    onIssuesUrlChange: setIssuesUrl,
    onLicenseKeyChange: setLicenseKey,
    onLicenseNameChange: setLicenseName,
    onLicenseUrlChange: setLicenseUrl,
    onLoadersChange: setLoaders,
    onProjectChange: selectProject,
    onSourceUrlChange: setSourceUrl,
    onSummaryChange: setSummary,
    onTitleChange: setTitle,
    onWikiUrlChange: setWikiUrl,
  };

  function buildInput(): UpdateProjectInput {
    return {
      categories: splitList(categories),
      description,
      discordUrl: nullableText(discordUrl),
      gameVersions: splitList(gameVersions),
      iconUrl: nullableText(iconUrl),
      issuesUrl: nullableText(issuesUrl),
      licenseKey,
      licenseName,
      licenseUrl: nullableText(licenseUrl),
      links: parseProjectLinks(extraLinks),
      loaders: splitList(loaders),
      projectSlug,
      sourceUrl: nullableText(sourceUrl),
      summary,
      title,
      wikiUrl: nullableText(wikiUrl),
    };
  }

  return { buildInput, fields, selectProject };
}
