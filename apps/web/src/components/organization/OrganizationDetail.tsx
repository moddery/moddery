import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  fetchOrganizationMembers,
  fetchOrganizationProfile,
  fetchOrganizationProjects,
} from '../../lib/organizations.ts';
import { type Mod } from '../../types.ts';
import { EmptyState } from '../EmptyState.tsx';
import { type SearchTag } from '../ModCard.tsx';
import { OrganizationHeader } from './OrganizationHeader.tsx';
import { OrganizationMembers } from './OrganizationMembers.tsx';
import { OrganizationProjectList } from './OrganizationProjectList.tsx';
import { OrganizationSkeleton } from './OrganizationSkeletons.tsx';

const memberPageSize = 24;
const projectPageSize = 12;

export function OrganizationDetail({
  slug,
  onBack,
  onOpenProject,
  onTagSearch,
}: {
  slug: string;
  onBack: () => void;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  const [memberPage, setMemberPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);

  useEffect(() => {
    setMemberPage(1);
    setProjectPage(1);
  }, [slug]);

  const organizationQuery = useQuery({
    queryFn: ({ signal }) => fetchOrganizationProfile(slug, signal),
    queryKey: ['organizations', slug],
  });
  const membersQuery = useQuery({
    enabled: Boolean(organizationQuery.data),
    queryFn: ({ signal }) =>
      fetchOrganizationMembers(slug, memberPage, memberPageSize, signal),
    queryKey: ['organizations', slug, 'members', memberPage],
  });
  const projectsQuery = useQuery({
    enabled: Boolean(organizationQuery.data),
    queryFn: ({ signal }) =>
      fetchOrganizationProjects(slug, projectPage, projectPageSize, signal),
    queryKey: ['organizations', slug, 'projects', projectPage],
  });

  if (organizationQuery.isLoading) {
    return <OrganizationSkeleton />;
  }

  if (!organizationQuery.data) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
        <EmptyState
          actionLabel="Back to organizations"
          onClear={onBack}
          itemLabel="organizations"
        />
      </main>
    );
  }

  const organization = organizationQuery.data;
  const memberTotal = membersQuery.data?.totalHits ?? organization.memberCount;
  const projectTotal =
    projectsQuery.data?.totalHits ?? organization.projectCount;

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <OrganizationHeader organization={organization} />
      <OrganizationMembers
        isLoading={membersQuery.isLoading}
        members={membersQuery.data?.members ?? organization.members}
        onPage={setMemberPage}
        organization={organization}
        page={memberPage}
        totalPages={Math.max(1, Math.ceil(memberTotal / memberPageSize))}
      />
      <OrganizationProjectList
        isLoading={projectsQuery.isLoading}
        onPage={setProjectPage}
        organization={organization}
        onOpenProject={onOpenProject}
        onTagSearch={onTagSearch}
        page={projectPage}
        projects={projectsQuery.data?.projects ?? organization.projects}
        totalPages={Math.max(1, Math.ceil(projectTotal / projectPageSize))}
      />
    </main>
  );
}
