import { type FormEvent, useState } from 'react';

import {
  updateProject,
  type DashboardProject,
  type UpdateProjectInput,
} from '../../lib/dashboard.ts';

export function ProjectMetadataForm({
  onUpdated,
  projects,
}: {
  onUpdated: () => Promise<void>;
  projects: DashboardProject[];
}) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const project =
    projects.find((item) => item.slug === projectSlug) ?? projects[0];
  const [title, setTitle] = useState(project?.title ?? '');
  const [summary, setSummary] = useState(project?.summary ?? '');
  const [description, setDescription] = useState(project?.body ?? '');
  const [iconUrl, setIconUrl] = useState(project?.iconUrl ?? '');
  const [sourceUrl, setSourceUrl] = useState(project?.sourceUrl ?? '');
  const [issuesUrl, setIssuesUrl] = useState(project?.issuesUrl ?? '');
  const [wikiUrl, setWikiUrl] = useState(project?.wikiUrl ?? '');
  const [discordUrl, setDiscordUrl] = useState(project?.discordUrl ?? '');
  const [licenseKey, setLicenseKey] = useState(project?.license.id ?? '');
  const [licenseName, setLicenseName] = useState(project?.license.name ?? '');
  const [licenseUrl, setLicenseUrl] = useState(project?.license.url ?? '');
  const [extraLinks, setExtraLinks] = useState(projectLinksText(project));
  const [loaders, setLoaders] = useState(project?.loaders.join(', ') ?? '');
  const [gameVersions, setGameVersions] = useState(
    project?.gameVersions.join(', ') ?? '',
  );
  const [categories, setCategories] = useState(
    project?.categories.join(', ') ?? '',
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);

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
    setError(null);
    setUpdated(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setUpdated(null);

    try {
      const project = await updateProject({
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
      });
      setUpdated(project.title);
      await onUpdated();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Project update failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Edit project metadata
        </h2>
        <p className="text-sm leading-6 text-muted">
          Update project copy, icons, links, and discovery tags.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <label className="grid gap-1 text-sm font-bold text-ink">
          Project
          <select
            value={projectSlug}
            onChange={(event) => selectProject(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <DashboardField
            label="Title"
            value={title}
            onChange={setTitle}
            required
          />
          <DashboardField
            label="Icon URL"
            value={iconUrl}
            onChange={setIconUrl}
          />
        </div>
        <DashboardField
          label="Summary"
          value={summary}
          onChange={setSummary}
          required
        />
        <label className="grid gap-1 text-sm font-bold text-ink">
          Description
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          />
        </label>
        <div className="grid gap-3 md:grid-cols-3">
          <DashboardField
            label="Loaders"
            value={loaders}
            onChange={setLoaders}
          />
          <DashboardField
            label="Game versions"
            value={gameVersions}
            onChange={setGameVersions}
          />
          <DashboardField
            label="Categories"
            value={categories}
            onChange={setCategories}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <DashboardField
            label="Source URL"
            value={sourceUrl}
            onChange={setSourceUrl}
          />
          <DashboardField
            label="Issues URL"
            value={issuesUrl}
            onChange={setIssuesUrl}
          />
          <DashboardField
            label="Wiki URL"
            value={wikiUrl}
            onChange={setWikiUrl}
          />
          <DashboardField
            label="Discord URL"
            value={discordUrl}
            onChange={setDiscordUrl}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <DashboardField
            label="License key"
            value={licenseKey}
            onChange={setLicenseKey}
            required
          />
          <DashboardField
            label="License name"
            value={licenseName}
            onChange={setLicenseName}
            required
          />
          <DashboardField
            label="License URL"
            value={licenseUrl}
            onChange={setLicenseUrl}
          />
        </div>
        <label className="grid gap-1 text-sm font-bold text-ink">
          Extra links
          <textarea
            value={extraLinks}
            onChange={(event) => setExtraLinks(event.target.value)}
            placeholder="DONATION | Sponsor | https://example.test"
            className="min-h-24 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
        {updated && (
          <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
            Updated {updated}.
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save project'}
          </button>
        </div>
      </form>
    </section>
  );
}

function DashboardField({
  label,
  onChange,
  placeholder,
  required,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold text-ink">
      {label}
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
      />
    </label>
  );
}

const directProjectLinkKinds = new Set(['SOURCE', 'ISSUES', 'WIKI', 'DISCORD']);

function projectLinksText(project: DashboardProject | undefined): string {
  return (
    project?.links
      .filter((link) => !directProjectLinkKinds.has(link.kind))
      .map((link) => [link.kind, link.label ?? '', link.url].join(' | '))
      .join('\n') ?? ''
  );
}

function parseProjectLinks(value: string): UpdateProjectInput['links'] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [kind = '', label = '', url = ''] = line
        .split('|')
        .map((part) => part.trim());
      return {
        kind,
        label: nullableText(label),
        url,
      };
    });
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}
