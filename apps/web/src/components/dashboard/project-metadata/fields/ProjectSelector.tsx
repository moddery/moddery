import { type ProjectMetadataFieldsProps } from '../ProjectMetadataFields.types.ts';

export function ProjectSelector({
  onProjectChange,
  projectSlug,
  projects,
}: Pick<
  ProjectMetadataFieldsProps,
  'onProjectChange' | 'projectSlug' | 'projects'
>) {
  return (
    <label className="grid gap-1 text-sm font-bold text-ink">
      Project
      <select
        value={projectSlug}
        onChange={(event) => onProjectChange(event.target.value)}
        className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
      >
        {projects.map((project) => (
          <option key={project.slug} value={project.slug}>
            {project.title}
          </option>
        ))}
      </select>
    </label>
  );
}
