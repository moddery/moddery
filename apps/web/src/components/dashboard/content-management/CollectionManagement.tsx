import {
  type DashboardCollection,
  type DashboardData,
} from '../../../lib/dashboard.ts';
import { CollectionProjectForms } from './CollectionProjectForms.tsx';
import { CollectionProjectOrderForm } from './CollectionProjectOrderForm.tsx';

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
  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      {projects.length > 0 && (
        <CollectionProjectForms
          collections={collections}
          ownerUsername={ownerUsername}
          projects={projects}
          onChanged={onChanged}
        />
      )}

      <CollectionProjectOrderForm
        collections={collections}
        onChanged={onChanged}
      />
    </div>
  );
}
