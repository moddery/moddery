import { useQuery } from '@tanstack/react-query';

import { fetchOrganizationProfile } from '../../lib/organizations.ts';
import { type Mod } from '../../types.ts';
import { EmptyState } from '../EmptyState.tsx';
import { OrganizationHeader } from './OrganizationHeader.tsx';
import { OrganizationMembers } from './OrganizationMembers.tsx';
import { OrganizationProjectList } from './OrganizationProjectList.tsx';
import { OrganizationSkeleton } from './OrganizationSkeletons.tsx';

export function OrganizationDetail({
  slug,
  onOpenProject,
}: {
  slug: string;
  onOpenProject: (mod: Mod) => void;
}) {
  const organizationQuery = useQuery({
    queryFn: ({ signal }) => fetchOrganizationProfile(slug, signal),
    queryKey: ['organizations', slug],
  });

  if (organizationQuery.isLoading) {
    return <OrganizationSkeleton />;
  }

  if (!organizationQuery.data) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
        <EmptyState
          onClear={() => window.history.back()}
          itemLabel="organizations"
        />
      </main>
    );
  }

  const organization = organizationQuery.data;

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <OrganizationHeader organization={organization} />
      <OrganizationMembers organization={organization} />
      <OrganizationProjectList
        organization={organization}
        onOpenProject={onOpenProject}
      />
    </main>
  );
}
