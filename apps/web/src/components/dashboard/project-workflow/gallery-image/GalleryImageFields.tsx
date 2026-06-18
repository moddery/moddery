import { type DashboardProject } from '../../../../lib/dashboard.ts';
import { DashboardField } from '../shared.tsx';

export function GalleryImageFields({
  description,
  displayUrl,
  featured,
  projectSlug,
  projects,
  rawUrl,
  sortOrder,
  title,
  onDescriptionChange,
  onDisplayUrlChange,
  onFeaturedChange,
  onLocalFileChange,
  onProjectSlugChange,
  onRawUrlChange,
  onSortOrderChange,
  onTitleChange,
}: {
  description: string;
  displayUrl: string;
  featured: boolean;
  projectSlug: string;
  projects: DashboardProject[];
  rawUrl: string;
  sortOrder: string;
  title: string;
  onDescriptionChange: (value: string) => void;
  onDisplayUrlChange: (value: string) => void;
  onFeaturedChange: (value: boolean) => void;
  onLocalFileChange: (value: File | null) => void;
  onProjectSlugChange: (value: string) => void;
  onRawUrlChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onTitleChange: (value: string) => void;
}) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-[1fr_10rem]">
        <label className="grid gap-1 text-sm font-bold text-ink">
          Project
          <select
            value={projectSlug}
            onChange={(event) => onProjectSlugChange(event.target.value)}
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
        <DashboardField
          label="Sort order"
          value={sortOrder}
          onChange={onSortOrderChange}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <DashboardField label="Title" value={title} onChange={onTitleChange} />
        <label className="grid gap-1 text-sm font-bold text-ink">
          Local image
          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              onLocalFileChange(event.target.files?.[0] ?? null)
            }
            className="h-10 rounded-lg border border-line bg-control px-3 py-2 text-sm font-bold text-ink outline-none transition-colors file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1 file:text-xs file:font-bold file:text-white hover:border-line-strong focus-visible:border-accent"
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-end gap-2 text-sm font-bold text-ink">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => onFeaturedChange(event.target.checked)}
            className="mb-3 size-4 accent-accent"
          />
          Featured
        </label>
      </div>
      <DashboardField
        label="Raw image URL"
        value={rawUrl}
        onChange={onRawUrlChange}
        required
      />
      <DashboardField
        label="Display image URL"
        value={displayUrl}
        onChange={onDisplayUrlChange}
        required
      />
      <label className="grid gap-1 text-sm font-bold text-ink">
        Description
        <textarea
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          className="min-h-24 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
        />
      </label>
    </>
  );
}
