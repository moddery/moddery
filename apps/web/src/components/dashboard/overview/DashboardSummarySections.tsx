import {
  dashboardProjectToMod,
  type DashboardData,
} from '../../../lib/dashboard.ts';
import { type Mod } from '../../../types.ts';
import { ModCard } from '../../ModCard.tsx';
import { CollectionRow, OrganizationRow } from '../ContentManagementPanels.tsx';

export function DashboardSummarySections({
  dashboard,
  onOpenProject,
}: {
  dashboard: DashboardData;
  onOpenProject: (mod: Mod) => void;
}) {
  return (
    <>
      <OrganizationsSummary dashboard={dashboard} />
      <ProjectsSummary dashboard={dashboard} onOpenProject={onOpenProject} />
      <CollectionsSummary dashboard={dashboard} />
    </>
  );
}

function OrganizationsSummary({ dashboard }: { dashboard: DashboardData }) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Organizations
        </h2>
        <span className="text-sm font-semibold text-muted">
          {dashboard.organizations.length.toLocaleString('en-US')} total
        </span>
      </div>

      {dashboard.organizations.length === 0 ? (
        <p className="py-8 text-sm text-muted">
          Creator groups you own will show up here.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {dashboard.organizations.map((organization) => (
            <OrganizationRow
              key={organization.id}
              organization={organization}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ProjectsSummary({
  dashboard,
  onOpenProject,
}: {
  dashboard: DashboardData;
  onOpenProject: (mod: Mod) => void;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Your projects
        </h2>
        <span className="text-sm font-semibold text-muted">
          {dashboard.projectCount.toLocaleString('en-US')} total
        </span>
      </div>

      {dashboard.projects.length === 0 ? (
        <p className="py-8 text-sm text-muted">
          Published projects you manage will show up here.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {dashboard.projects.map((project) => {
            const mod = dashboardProjectToMod(project);
            return (
              <ModCard
                key={project.slug}
                mod={mod}
                layout="list"
                onOpen={onOpenProject}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

function CollectionsSummary({ dashboard }: { dashboard: DashboardData }) {
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
          Public collections you own will show up here.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {dashboard.collections.map((collection) => (
            <CollectionRow key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </section>
  );
}
