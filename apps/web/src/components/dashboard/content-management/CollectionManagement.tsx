import {
  type DashboardCollection,
  type DashboardData,
} from '../../../lib/dashboard.ts';
import { CollectionProjectForms } from './CollectionProjectForms.tsx';
import { CollectionProjectOrderForm } from './CollectionProjectOrderForm.tsx';
import { CreateCollectionForm } from './CreateCollectionForm.tsx';
import { EditCollectionForm } from './EditCollectionForm.tsx';

export function CollectionManagement({
  collections,
  onChanged,
  ownerUsername,
  projects,
}: {
  collections: DashboardCollection[];
  onChanged: () => Promise<void>;
  ownerUsername: string;
  projects: DashboardData['projects'];
}) {
  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Manage collections
        </h2>
        <p className="text-sm leading-6 text-muted">
          Create curated lists and add managed projects to them.
        </p>
      </div>

      <CreateCollectionForm onCreated={onChanged} />

      {collections.length > 0 && (
        <EditCollectionForm collections={collections} onUpdated={onChanged} />
      )}

      {collections.length > 0 && projects.length > 0 && (
        <CollectionProjectForms
          collections={collections}
          ownerUsername={ownerUsername}
          projects={projects}
          onChanged={onChanged}
        />
      )}

      {collections.length > 0 && (
        <CollectionProjectOrderForm
          collections={collections}
          onChanged={onChanged}
        />
      )}
    </section>
  );
}
