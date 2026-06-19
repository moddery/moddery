import { type FormEvent, useState } from 'react';

import {
  addProjectGalleryImage,
  type DashboardProject,
  uploadProjectFile,
} from '../../../lib/dashboard.ts';
import { GalleryImageFields } from './gallery-image/GalleryImageFields.tsx';
import { GalleryImageManager } from './gallery-image/GalleryImageManager.tsx';
import { GalleryPreview } from './gallery-image/GalleryPreview.tsx';
import { nullableText } from './shared.tsx';

export function AddGalleryImageForm({
  onAdded,
  projects,
}: {
  onAdded: () => Promise<void>;
  projects: DashboardProject[];
}) {
  const [projectSlug, setProjectSlug] = useState(projects[0]?.slug ?? '');
  const project = projects.find((item) => item.slug === projectSlug);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rawUrl, setRawUrl] = useState('');
  const [displayUrl, setDisplayUrl] = useState('');
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setCreated(null);

    try {
      let nextRawUrl = rawUrl;
      let nextDisplayUrl = displayUrl;
      if (localFile !== null) {
        const target = await uploadProjectFile({
          file: localFile,
          projectSlug,
          uploadKind: 'gallery-image',
        });
        nextRawUrl = target.objectUrl;
        nextDisplayUrl = target.objectUrl;
      }
      const project = await addProjectGalleryImage({
        description: nullableText(description),
        displayUrl: nextDisplayUrl,
        featured,
        projectSlug,
        rawUrl: nextRawUrl,
        sortOrder: sortOrder.trim() === '' ? null : Number(sortOrder),
        title: nullableText(title),
      });
      setCreated(project.title);
      setTitle('');
      setDescription('');
      setRawUrl('');
      setDisplayUrl('');
      setLocalFile(null);
      setFeatured(false);
      setSortOrder('0');
      await onAdded();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Gallery image failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Add gallery image
        </h2>
        <p className="text-sm leading-6 text-muted">
          Add screenshots or preview media to a managed project.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <GalleryImageFields
          description={description}
          disabled={submitting}
          displayUrl={displayUrl}
          featured={featured}
          hasLocalFile={localFile !== null}
          projectSlug={projectSlug}
          projects={projects}
          rawUrl={rawUrl}
          sortOrder={sortOrder}
          title={title}
          onDescriptionChange={setDescription}
          onDisplayUrlChange={setDisplayUrl}
          onFeaturedChange={setFeatured}
          onLocalFileChange={(file) => {
            setLocalFile(file);
            if (file !== null && title.trim().length === 0) {
              setTitle(file.name);
            }
          }}
          onProjectSlugChange={(slug) => {
            setProjectSlug(slug);
            setCreated(null);
            setError(null);
          }}
          onRawUrlChange={setRawUrl}
          onSortOrderChange={setSortOrder}
          onTitleChange={setTitle}
        />

        {project && project.gallery.length > 0 && (
          <>
            <GalleryPreview images={project.gallery} />
            <GalleryImageManager images={project.gallery} onChanged={onAdded} />
          </>
        )}

        {error && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
        {created && (
          <p className="rounded-lg bg-control px-3 py-2 text-sm font-bold text-ink">
            Added image to {created}.
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {addGalleryImageButtonLabel(submitting)}
          </button>
        </div>
      </form>
    </section>
  );
}

export function addGalleryImageButtonLabel(submitting: boolean) {
  return submitting ? 'Adding...' : 'Add gallery image';
}
