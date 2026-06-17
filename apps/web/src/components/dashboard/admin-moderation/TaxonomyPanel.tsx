import { useQuery } from '@tanstack/react-query';
import { type ProjectKind } from '@moddery/shared';
import { FolderKanban } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import {
  fetchCategoryTaxonomy,
  fetchGameVersionTaxonomy,
  upsertCategory,
  upsertGameVersion,
  type CategoryTaxonomy,
} from '../../../lib/dashboard.ts';
import { nullableText } from './shared.tsx';
import { TaxonomyCategoryForm } from './taxonomy/TaxonomyCategoryForm.tsx';
import { TaxonomyGameVersionForm } from './taxonomy/TaxonomyGameVersionForm.tsx';

export function TaxonomyPanel() {
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryKind, setCategoryKind] = useState<ProjectKind | ''>('');
  const [gameVersion, setGameVersion] = useState('');
  const [gameVersionActive, setGameVersionActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const categoriesQuery = useQuery({
    queryFn: ({ signal }) => fetchCategoryTaxonomy(signal),
    queryKey: ['dashboard', 'taxonomy-categories'],
  });
  const gameVersionsQuery = useQuery({
    queryFn: ({ signal }) => fetchGameVersionTaxonomy(signal),
    queryKey: ['dashboard', 'taxonomy-game-versions'],
  });
  const categories = categoriesQuery.data ?? [];
  const gameVersions = gameVersionsQuery.data ?? [];

  function fillCategory(category: CategoryTaxonomy) {
    setCategorySlug(category.slug);
    setCategoryName(category.name);
    setCategoryDescription(category.description ?? '');
    setCategoryKind(category.projectKind ?? '');
    setMessage(null);
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const category = await upsertCategory({
        description: nullableText(categoryDescription),
        name: categoryName,
        projectKind: categoryKind === '' ? null : categoryKind,
        slug: categorySlug,
      });
      await categoriesQuery.refetch();
      setMessage(`Saved category ${category.slug}.`);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Category failed');
    } finally {
      setBusy(false);
    }
  }

  async function submitGameVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const saved = await upsertGameVersion({
        isActive: gameVersionActive,
        version: gameVersion,
      });
      await gameVersionsQuery.refetch();
      setMessage(`Saved game version ${saved.version}.`);
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Game version failed',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Taxonomy
          </h2>
          <p className="mt-1 text-sm text-muted">
            Manage category and game version rows used by discovery.
          </p>
        </div>
        <FolderKanban className="size-5 text-accent-icon" />
      </div>
      {message && (
        <p className="mt-3 text-sm font-semibold text-muted">{message}</p>
      )}

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <TaxonomyCategoryForm
          busy={busy}
          categories={categories}
          categoryDescription={categoryDescription}
          categoryKind={categoryKind}
          categoryName={categoryName}
          categorySlug={categorySlug}
          onCategoryDescriptionChange={setCategoryDescription}
          onCategoryKindChange={setCategoryKind}
          onCategoryNameChange={setCategoryName}
          onCategorySlugChange={setCategorySlug}
          onSelect={fillCategory}
          onSubmit={(event) => void submitCategory(event)}
        />

        <TaxonomyGameVersionForm
          busy={busy}
          gameVersion={gameVersion}
          gameVersionActive={gameVersionActive}
          gameVersions={gameVersions}
          onGameVersionActiveChange={setGameVersionActive}
          onGameVersionChange={setGameVersion}
          onSubmit={(event) => void submitGameVersion(event)}
        />
      </div>
    </section>
  );
}
