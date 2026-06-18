import { timeAgo } from '../../lib/format.ts';
import {
  userProjectToMod,
  type UserCollectionPreview,
} from '../../lib/users.ts';
import type { Mod } from '../../types.ts';
import { ModCard, type SearchTag } from '../ModCard.tsx';

export function CollectionPreview({
  collection,
  ownerUsername,
  onOpenCollection,
  onOpenProject,
  onTagSearch,
}: {
  collection: UserCollectionPreview;
  ownerUsername: string;
  onOpenCollection?: (collection: {
    ownerUsername: string;
    slug: string;
  }) => void;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  return (
    <section className="border-b border-line pb-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          aria-hidden="true"
          className="size-3 rounded-full"
          style={{ backgroundColor: collection.color ?? '#1d9bf0' }}
        />
        <a
          href={collectionHref(ownerUsername, collection.slug)}
          onClick={(event) => {
            if (!onOpenCollection) return;
            event.preventDefault();
            onOpenCollection({ ownerUsername, slug: collection.slug });
          }}
          className="text-ink transition-colors hover:text-accent"
        >
          <h3 className="font-display text-lg font-extrabold">
            {collection.name}
          </h3>
        </a>
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
              onTagSearch={onTagSearch}
            />
          );
        })}
      </div>
    </section>
  );
}

function collectionHref(ownerUsername: string, slug: string): string {
  return `/collections/${encodeURIComponent(
    ownerUsername,
  )}/${encodeURIComponent(slug)}`;
}
