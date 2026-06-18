import { type DashboardProject } from '../../../../lib/dashboard.ts';
import {
  type ProjectFile,
  type ProjectVersion,
} from '../../../../lib/catalog.ts';

export function FileScanSelectors({
  fileId,
  files,
  projectSlug,
  projects,
  selectedVersion,
  versions,
  versionId,
  onFileChange,
  onProjectChange,
  onVersionChange,
}: {
  fileId: string;
  files: ProjectFile[];
  projectSlug: string;
  projects: DashboardProject[];
  selectedVersion: ProjectVersion | null;
  versions: ProjectVersion[];
  versionId: string;
  onFileChange: (id: string) => void;
  onProjectChange: (slug: string) => void;
  onVersionChange: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <label className="grid gap-1 text-sm font-bold text-ink">
        Project
        <select
          value={projectSlug}
          onChange={(event) => onProjectChange(event.target.value)}
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
        >
          {projects.map((project) => (
            <option key={project.slug} value={project.slug}>
              {project.title}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-bold text-ink">
        Version
        <select
          value={selectedVersion?.id ?? versionId}
          onChange={(event) => onVersionChange(event.target.value)}
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
        >
          {versions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.name} {version.versionNumber}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-bold text-ink">
        File
        <select
          value={fileId}
          onChange={(event) => onFileChange(event.target.value)}
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
        >
          {files.map((file) => (
            <option key={file.id} value={file.id}>
              {file.filename}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
