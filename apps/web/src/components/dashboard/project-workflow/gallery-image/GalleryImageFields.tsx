import { type DashboardProject } from '../../../../lib/dashboard.ts';
import { FileDropzone } from '../../../ui/dashboard/index.ts';
import { DashboardField } from '../shared.tsx';

export function GalleryImageFields({
  description,
  disabled,
  featured,
  localFile,
  projectSlug,
  projects,
  sortOrder,
  title,
  onDescriptionChange,
  onFeaturedChange,
  onLocalFileChange,
  onProjectSlugChange,
  onSortOrderChange,
  onTitleChange,
}: {
  description: string;
  disabled?: boolean;
  featured: boolean;
  localFile: File | null;
  projectSlug: string;
  projects: DashboardProject[];
  sortOrder: string;
  title: string;
  onDescriptionChange: (value: string) => void;
  onFeaturedChange: (value: boolean) => void;
  onLocalFileChange: (value: File | null) => void;
  onProjectSlugChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onTitleChange: (value: string) => void;
}) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-[1fr_10rem]">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Project
          <select
            disabled={disabled}
            value={projectSlug}
            onChange={(event) => onProjectSlugChange(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
        <DashboardField
          disabled={disabled}
          label="Sort order"
          value={sortOrder}
          onChange={onSortOrderChange}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <DashboardField
          disabled={disabled}
          label="Title"
          value={title}
          onChange={onTitleChange}
        />
        <FileDropzone
          accept="image/png,image/jpeg,image/gif,image/webp"
          disabled={disabled}
          file={localFile}
          label="Gallery image"
          onFileChange={onLocalFileChange}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-end gap-2 text-sm font-bold text-ink">
          <input
            disabled={disabled}
            type="checkbox"
            checked={featured}
            onChange={(event) => onFeaturedChange(event.target.checked)}
            className="mb-3 size-4 accent-accent disabled:cursor-not-allowed"
          />
          Featured
        </label>
      </div>
      <label className="grid gap-1 text-sm font-bold text-ink">
        Description
        <textarea
          disabled={disabled}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          className="min-h-24 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
    </>
  );
}
