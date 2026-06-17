import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

import { type ProjectGalleryImage } from '../../../lib/catalog.ts';
import { cn } from '../../../lib/cn.ts';
import { EmptyTab } from './EmptyTab.tsx';

export function GalleryTab({ images }: { images: ProjectGalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState(-1);

  if (!images.length) {
    return (
      <EmptyTab
        title="No gallery yet"
        body="This project has not added screenshots or preview media."
      />
    );
  }

  const slides = images.map((image) => ({
    src: image.raw_url || image.url,
    alt: image.title ?? 'Project gallery image',
    title: image.title ?? undefined,
    description: image.description ?? undefined,
  }));

  return (
    <section aria-label="Gallery" className="grid gap-6 md:grid-cols-2">
      {images.map((image, index) => (
        <figure
          key={`${image.url}-${image.created}`}
          className={cn(
            index === 0 && images.length > 2 ? 'md:col-span-2' : '',
          )}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`Open ${image.title ?? 'gallery image'} in viewer`}
            className="block w-full overflow-hidden rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:opacity-90"
          >
            <img
              src={image.url || image.raw_url}
              alt={image.title ?? 'Project gallery image'}
              loading="lazy"
              className="aspect-video w-full bg-surface-2 object-cover"
            />
          </button>
          {(image.title || image.description) && (
            <figcaption className="mt-2 text-sm leading-6 text-ink">
              {image.title && (
                <strong className="font-extrabold">{image.title}</strong>
              )}
              {image.description && (
                <p className="mt-0.5 text-sm leading-6 text-muted">
                  {image.description}
                </p>
              )}
            </figcaption>
          )}
        </figure>
      ))}

      <Lightbox
        open={openIndex >= 0}
        index={openIndex}
        close={() => setOpenIndex(-1)}
        slides={slides}
        plugins={[Captions, Counter, Thumbnails, Zoom]}
        captions={{ descriptionTextAlign: 'center' }}
        counter={{ container: { style: { top: 0, left: 0 } } }}
        styles={{
          root: {
            '--yarl__color_backdrop': 'rgba(0, 0, 0, 0.92)',
            '--yarl__slide_captions_container_background': 'transparent',
          },
        }}
      />
    </section>
  );
}
