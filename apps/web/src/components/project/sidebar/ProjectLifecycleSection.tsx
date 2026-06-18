import { type ProjectDetails } from '../../../lib/catalog.ts';
import { formatDate } from '../../../lib/format.ts';
import { enumLabel } from '../../../lib/labels.ts';
import { MetaRow } from './MetaRow.tsx';

export function ProjectLifecycleSection({
  project,
}: {
  project: ProjectDetails;
}) {
  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-extrabold text-ink">
        Project status
      </h2>
      <div className="mt-3 divide-y divide-line/70">
        <MetaRow label="Status" value={enumLabel(project.status)} />
        {project.requestedStatus && (
          <MetaRow
            label="Requested"
            value={enumLabel(project.requestedStatus)}
          />
        )}
        {project.queuedAt && (
          <MetaRow label="Queued" value={formatDate(project.queuedAt)} />
        )}
        {project.approvedAt && (
          <MetaRow label="Approved" value={formatDate(project.approvedAt)} />
        )}
        {project.archivedAt && (
          <MetaRow label="Archived" value={formatDate(project.archivedAt)} />
        )}
      </div>
    </section>
  );
}
