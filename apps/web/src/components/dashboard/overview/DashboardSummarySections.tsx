import { type DashboardData } from '../../../lib/dashboard.ts';
import { type Mod } from '../../../types.ts';
import { FollowedProjectsSummary } from './FollowedProjectsSummary.tsx';
import { CollectionsSummary } from './summary-sections/CollectionsSummary.tsx';
import { OrganizationsSummary } from './summary-sections/OrganizationsSummary.tsx';
import { ProjectsSummary } from './summary-sections/ProjectsSummary.tsx';

export function DashboardSummarySections({
  dashboard,
  onOpenCollection,
  onOpenProject,
}: {
  dashboard: DashboardData;
  onOpenCollection?: (collection: {
    ownerUsername: string;
    slug: string;
  }) => void;
  onOpenProject: (mod: Mod) => void;
}) {
  return (
    <>
      <OrganizationsSummary dashboard={dashboard} />
      <ProjectsSummary dashboard={dashboard} onOpenProject={onOpenProject} />
      <FollowedProjectsSummary
        dashboard={dashboard}
        onOpenProject={onOpenProject}
      />
      <CollectionsSummary
        dashboard={dashboard}
        onOpenCollection={onOpenCollection}
      />
    </>
  );
}
