import { type DashboardGalleryImage } from '../../../../lib/dashboard.ts';

export function GalleryPreview({
  images,
}: {
  images: DashboardGalleryImage[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {images.slice(0, 4).map((image) => (
        <figure key={`${image.rawUrl}-${image.sortOrder}`} className="min-w-0">
          <img
            src={image.displayUrl}
            alt={image.title ?? ''}
            className="aspect-video w-full rounded-lg border border-line bg-surface-2 object-cover"
          />
          <figcaption className="mt-1 truncate text-xs font-semibold text-muted">
            {image.title ?? image.displayUrl}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
