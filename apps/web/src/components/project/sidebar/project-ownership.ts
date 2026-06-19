import { organizationPath, userPath } from '../../../app/routing.ts';
import {
  type ProjectDetails,
  type ProjectMember,
} from '../../../lib/catalog.ts';

export interface ProjectOwnershipSummary {
  href: string | null;
  label: string;
  name: string;
  teamSize: number;
}

export function projectOwnershipSummary({
  members,
  project,
}: {
  members: ProjectMember[];
  project: ProjectDetails;
}): ProjectOwnershipSummary {
  if (project.organization) {
    return {
      href: organizationPath(project.organization.slug),
      label: 'Organization',
      name: project.organization.name,
      teamSize: members.length,
    };
  }

  const owner =
    members.find((member) => member.owner) ??
    members.find((member) => member.user.username === project.authorUsername);
  const ownerName =
    owner?.user.displayName ?? owner?.user.username ?? project.author;
  const ownerUsername = owner?.user.username ?? project.authorUsername ?? null;

  return {
    href: ownerUsername === null ? null : userPath(ownerUsername),
    label: 'Creator',
    name: ownerName,
    teamSize: members.length,
  };
}
