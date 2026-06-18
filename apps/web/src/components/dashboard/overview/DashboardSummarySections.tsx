import { type DashboardData } from '../../../lib/dashboard.ts';
import { type Mod } from '../../../types.ts';
import { type SearchTag } from '../../ModCard.tsx';
import { FollowedProjectsSummary } from './FollowedProjectsSummary.tsx';
import { CollectionsSummary } from './summary-sections/CollectionsSummary.tsx';
import { OrganizationsSummary } from './summary-sections/OrganizationsSummary.tsx';
import { ProjectsSummary } from './summary-sections/ProjectsSummary.tsx';

export function DashboardSummarySections({
  dashboard,
  onOpenCollection,
  onOpenProject,
  onTagSearch,
  onUpdated,
}: {
  dashboard: DashboardData;
  onOpenCollection?: (collection: {
    ownerUsername: string;
    slug: string;
  }) => void;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
  onUpdated: () => Promise<void>;
}) {
  return (
    <>
      <OrganizationsSummary dashboard={dashboard} />
      <ProjectsSummary
        dashboard={dashboard}
        onOpenProject={onOpenProject}
        onTagSearch={onTagSearch}
      />
      <FollowedProjectsSummary
        dashboard={dashboard}
        onOpenProject={onOpenProject}
        onTagSearch={onTagSearch}
        onUpdated={onUpdated}
      />
      <CollectionsSummary
        dashboard={dashboard}
        onOpenCollection={onOpenCollection}
      />
    </>
  );
}
