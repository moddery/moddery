import { type ProjectKind } from '@moddery/shared';
import { type FormEvent } from 'react';

import { type CategoryTaxonomy } from '../../../../lib/dashboard.ts';
import { DashboardField } from '../shared.tsx';
import { taxonomyProjectKinds } from './constants.ts';

export function TaxonomyCategoryForm({
  busy,
  categoryDescription,
  categoryKind,
  categoryName,
  categorySlug,
  categories,
  onCategoryDescriptionChange,
  onCategoryKindChange,
  onCategoryNameChange,
  onCategorySlugChange,
  onSelect,
  onSubmit,
}: {
  busy: boolean;
  categoryDescription: string;
  categoryKind: ProjectKind | '';
  categoryName: string;
  categorySlug: string;
  categories: CategoryTaxonomy[];
  onCategoryDescriptionChange: (value: string) => void;
  onCategoryKindChange: (value: ProjectKind | '') => void;
  onCategoryNameChange: (value: string) => void;
  onCategorySlugChange: (value: string) => void;
  onSelect: (category: CategoryTaxonomy) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <h3 className="font-display text-base font-extrabold text-ink">
        Category
      </h3>
      <div className="grid gap-3 md:grid-cols-2">
        <DashboardField
          label="Slug"
          value={categorySlug}
          onChange={onCategorySlugChange}
          required
        />
        <DashboardField
          label="Name"
          value={categoryName}
          onChange={onCategoryNameChange}
          required
        />
      </div>
      <label className="grid gap-1 text-sm font-bold text-ink">
        Project kind
        <select
          value={categoryKind}
          onChange={(event) =>
            onCategoryKindChange(event.target.value as ProjectKind | '')
          }
          className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent"
        >
          {taxonomyProjectKinds.map((kind) => (
            <option key={kind.value} value={kind.value}>
              {kind.label}
            </option>
          ))}
        </select>
      </label>
      <DashboardField
        label="Description"
        value={categoryDescription}
        onChange={onCategoryDescriptionChange}
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        Save category
      </button>
      <TaxonomyCategoryList categories={categories} onSelect={onSelect} />
    </form>
  );
}

function TaxonomyCategoryList({
  categories,
  onSelect,
}: {
  categories: CategoryTaxonomy[];
  onSelect: (category: CategoryTaxonomy) => void;
}) {
  if (categories.length === 0) {
    return (
      <p className="text-sm font-semibold text-muted">No categories yet.</p>
    );
  }

  return (
    <div className="mt-1 grid gap-2">
      {categories.slice(0, 12).map((category) => (
        <button
          key={category.slug}
          type="button"
          onClick={() => onSelect(category)}
          className="flex items-center justify-between gap-3 rounded-lg border border-line bg-control px-3 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-control-hover"
        >
          <span>{category.name}</span>
          <span className="text-xs text-muted">{category.slug}</span>
        </button>
      ))}
    </div>
  );
}
