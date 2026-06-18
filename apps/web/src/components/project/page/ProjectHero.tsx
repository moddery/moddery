import { type ProjectType } from '../../../types.ts';
import { type SearchTag } from '../../ModCard.tsx';
import { CategoryTag, Chip, LoaderTag } from '../../Chips.tsx';
import { type ProjectDetails } from '../../../lib/catalog.ts';
import { projectTypeMeta } from '../../../lib/projectTypes.ts';
import { organizationPath, userPath } from '../../../app/routing.ts';

export function ProjectHero({
  categories,
  onTagSearch,
  project,
  projectType,
}: {
  categories: string[];
  onTagSearch?: (tag: SearchTag) => void;
  project: ProjectDetails;
  projectType: ProjectType;
}) {
  const meta = projectTypeMeta(projectType);

  return (
    <header className="mt-5 pb-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {project.iconUrl ? (
          <img
            src={project.iconUrl}
            alt={`${project.title} icon`}
            width={96}
            height={96}
            className="size-20 rounded-md bg-surface-2 object-cover sm:size-24"
          />
        ) : (
          <div
            aria-hidden="true"
            className="size-20 rounded-md bg-surface-2 sm:size-24"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="font-display text-3xl font-extrabold leading-tight text-ink">
              {project.title}
            </h1>
            {project.organization ? (
              <span className="text-sm font-medium text-muted">
                by{' '}
                <a
                  href={organizationPath(project.organization.slug)}
                  className="text-muted transition-colors hover:text-accent"
                >
                  {project.organization.name}
                </a>
              </span>
            ) : project.author ? (
              <span className="text-sm font-medium text-muted">
                by{' '}
                {project.authorUsername ? (
                  <a
                    href={userPath(project.authorUsername)}
                    className="text-muted transition-colors hover:text-accent"
                  >
                    {project.author}
                  </a>
                ) : (
                  project.author
                )}
              </span>
            ) : null}
          </div>

          <p className="mt-3 max-w-3xl text-pretty text-base leading-7 text-muted">
            {project.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {project.loaders.map((loader) => (
              <LoaderTag
                key={loader}
                loader={loader}
                onClick={
                  onTagSearch === undefined
                    ? undefined
                    : () =>
                        onTagSearch({
                          kind: 'loader',
                          projectType,
                          value: loader,
                        })
                }
              />
            ))}
            {categories.slice(0, 6).map((category) => (
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
            <Chip>{meta.label}</Chip>
          </div>
        </div>
      </div>
    </header>
  );
}
