import { Building2, UserRound } from 'lucide-react';

import {
  type ProjectDetails,
  type ProjectMember,
} from '../../../lib/catalog.ts';
import { projectOwnershipSummary } from './project-ownership.ts';

export function ProjectOwnershipSection({
  members,
  project,
}: {
  members: ProjectMember[];
  project: ProjectDetails;
}) {
  const ownership = projectOwnershipSummary({ members, project });
  const Icon = ownership.label === 'Organization' ? Building2 : UserRound;
  const teamLabel =
    ownership.teamSize === 1
      ? '1 team member'
      : `${ownership.teamSize.toLocaleString('en-US')} team members`;
  const content = (
    <>
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-surface-2 text-accent-icon">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-ink">
          {ownership.name}
        </span>
        <span className="block text-xs font-semibold text-muted">
          {ownership.label} - {teamLabel}
        </span>
      </span>
    </>
  );

  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-extrabold text-ink">
        Ownership
      </h2>
      {ownership.href ? (
        <a
          href={ownership.href}
          className="mt-3 flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-2"
        >
          {content}
        </a>
      ) : (
        <div className="mt-3 flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5">
          {content}
        </div>
      )}
    </section>
  );
}
