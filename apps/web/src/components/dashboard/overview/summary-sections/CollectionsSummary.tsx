import { type SelectedProject } from '../../../../app/routing.ts';
import { type DashboardData } from '../../../../lib/dashboard.ts';
import { CollectionRow } from '../../ContentManagementPanels.tsx';

export function CollectionsSummary({
  dashboard,
  onOpenCollection,
  onOpenProjectReference,
}: {
  dashboard: DashboardData;
  onOpenCollection?: (collection: {
    ownerUsername: string;
    slug: string;
  }) => void;
  onOpenProjectReference?: (project: SelectedProject) => void;
}) {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Collections
        </h2>
        <span className="text-sm font-semibold text-muted">
          {dashboard.collectionCount.toLocaleString('en-US')} total
        </span>
      </div>

      {dashboard.collections.length === 0 ? (
        <p className="py-8 text-sm text-muted">
          Collections you own will show up here.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {dashboard.collections.map((collection) => (
            <CollectionRow
              key={collection.id}
              collection={collection}
              ownerUsername={dashboard.username}
              onOpenCollection={onOpenCollection}
              onOpenProjectReference={onOpenProjectReference}
            />
          ))}
        </div>
      )}
    </section>
  );
}
