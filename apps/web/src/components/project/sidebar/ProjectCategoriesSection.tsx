import { CategoryTag } from '../../Chips.tsx';
import { type SearchTag } from '../../ModCard.tsx';
import { type ProjectType } from '../../../types.ts';

export function ProjectCategoriesSection({
  categories,
  onTagSearch,
  projectType,
}: {
  categories: string[];
  onTagSearch?: (tag: SearchTag) => void;
  projectType: ProjectType;
}) {
  if (categories.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-extrabold text-ink">
        Categories
      </h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {categories.map((category) => (
          <CategoryTag
            key={category}
            category={category}
            onClick={
              onTagSearch === undefined
                ? undefined
                : () =>
                    onTagSearch({
                      kind: 'category',
                      projectType,
                      value: category,
                    })
            }
          />
        ))}
      </div>
    </section>
  );
}
