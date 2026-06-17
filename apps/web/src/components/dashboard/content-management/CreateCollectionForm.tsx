import { type CollectionVisibility } from '@moddery/shared';
import { type FormEvent, useState } from 'react';

import {
  createCollection,
  type CreateCollectionInput,
} from '../../../lib/dashboard.ts';
import { DashboardField } from './shared.tsx';

export function CreateCollectionForm({
  onCreated,
}: {
  onCreated: () => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [color, setColor] = useState('#1d9bf0');
  const [visibility, setVisibility] = useState<CollectionVisibility>('PRIVATE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: CreateCollectionInput = {
      color: color.trim() || null,
      description: description.trim() || null,
      iconUrl: iconUrl.trim() || null,
      name,
      slug,
      visibility,
    };

    try {
      await createCollection(input);
      setName('');
      setSlug('');
      setDescription('');
      setIconUrl('');
      setColor('#1d9bf0');
      setVisibility('PRIVATE');
      await onCreated();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Collection creation failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="mt-4 grid gap-3">
      <div className="grid gap-3 md:grid-cols-3">
        <DashboardField label="Name" value={name} onChange={setName} required />
        <DashboardField label="Slug" value={slug} onChange={setSlug} required />
        <label className="grid gap-1 text-sm font-bold text-ink">
          Visibility
          <select
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as CollectionVisibility)
            }
            className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
          >
            <option value="PRIVATE">Private</option>
            <option value="UNLISTED">Unlisted</option>
            <option value="PUBLIC">Public</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_10rem]">
        <DashboardField
          label="Description"
          value={description}
          onChange={setDescription}
        />
        <DashboardField
          label="Icon URL"
          value={iconUrl}
          onChange={setIconUrl}
        />
        <DashboardField label="Color" value={color} onChange={setColor} />
      </div>

      {error && (
        <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating...' : 'Create collection'}
        </button>
      </div>
    </form>
  );
}
