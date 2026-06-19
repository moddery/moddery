import { type ProjectKind } from '@moddery/shared';

import { type CategoryFilterTag } from '../../lib/catalog.ts';
import { CONTENT_TYPES, projectKindFromType } from '../../lib/projectTypes.ts';
import { CategoryTag } from '../Chips.tsx';
import { buildPlatformDiscoverHref } from './platformDiscoverHref.ts';
import { PlatformSectionHeader } from './PlatformSectionHeader.tsx';

export function PlatformCategoriesSection({
  categories,
}: {
  categories: CategoryFilterTag[];
}) {
  const globalCategories = categories.filter(
    (category) => category.projectKind === null,
  );

  return (
    <section>
      <PlatformSectionHeader
        title="Categories"
        subtitle="Project tags used for discovery and filtering."
      />
      <div className="mt-4 grid gap-5">
        {globalCategories.length > 0 && (
          <CategoryGroup
            categories={globalCategories}
            title="All project types"
          />
        )}
        {CONTENT_TYPES.map((projectType) => {
          const projectKind = projectKindFromType(projectType.type);
          const scopedCategories = categories.filter(
            (category) => category.projectKind === projectKind,
          );
          if (scopedCategories.length === 0) return null;

          return (
            <CategoryGroup
              key={projectType.type}
              categories={scopedCategories}
              projectKind={projectKind}
              title={projectType.label}
            />
          );
        })}
      </div>
    </section>
  );
}

function CategoryGroup({
  categories,
  projectKind,
  title,
}: {
  categories: CategoryFilterTag[];
  projectKind?: ProjectKind;
  title: string;
}) {
  return (
    <div>
      <h3 className="font-display text-base font-extrabold text-ink">
        {title}
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {categories.map((category) => (
          <a
            key={`${projectKind ?? 'all'}-${category.slug}`}
            href={buildPlatformDiscoverHref({
              category: category.slug,
              projectKind: category.projectKind ?? projectKind,
            })}
            className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <CategoryTag category={category.slug} />
          </a>
        ))}
      </div>
    </div>
  );
}
