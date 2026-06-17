import { timeAgo } from '../../lib/format.ts';
import {
  userProjectToMod,
  type UserCollectionPreview,
} from '../../lib/users.ts';
import type { Mod } from '../../types.ts';
import { ModCard } from '../ModCard.tsx';

export function CollectionPreview({
  collection,
  onOpenProject,
}: {
  collection: UserCollectionPreview;
  onOpenProject: (mod: Mod) => void;
}) {
  return (
    <section className="border-b border-line pb-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          aria-hidden="true"
          className="size-3 rounded-full"
          style={{ backgroundColor: collection.color ?? '#1d9bf0' }}
        />
        <h3 className="font-display text-lg font-extrabold text-ink">
          {collection.name}
        </h3>
        <span className="text-sm font-semibold text-muted">
          {collection.projectCount.toLocaleString('en-US')} projects · updated{' '}
          {timeAgo(collection.updatedAt)}
        </span>
      </div>
      {collection.description && (
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
          {collection.description}
        </p>
      )}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {collection.projects.map((project) => {
          const mod = userProjectToMod(project);
          return (
            <ModCard
              key={project.slug}
              mod={mod}
              layout="list"
              onOpen={onOpenProject}
            />
          );
        })}
      </div>
    </section>
  );
}
