import {
  organizationProjectToMod,
  type OrganizationProfile,
  type OrganizationProjectPreview,
} from '../../lib/organizations.ts';
import { type Mod } from '../../types.ts';
import { ModCard } from '../ModCard.tsx';
import { Pagination } from '../Pagination.tsx';

export function OrganizationProjectList({
  isLoading,
  onPage,
  organization,
  onOpenProject,
  page,
  projects,
  totalPages,
}: {
  isLoading: boolean;
  onPage: (page: number) => void;
  organization: OrganizationProfile;
  onOpenProject: (mod: Mod) => void;
  page: number;
  projects: OrganizationProjectPreview[];
  totalPages: number;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Projects
        </h2>
        <span className="text-sm font-semibold text-muted">
          {organization.projectCount.toLocaleString('en-US')} total
        </span>
      </div>

      {isLoading ? (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="h-28 animate-pulse rounded-lg bg-surface-2" />
          <div className="h-28 animate-pulse rounded-lg bg-surface-2" />
        </div>
      ) : projects.length === 0 ? (
        <p className="py-8 text-sm text-muted">No public projects yet.</p>
      ) : (
        <OrganizationProjectGrid
          projects={projects}
          onOpenProject={onOpenProject}
        />
      )}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
    </section>
  );
}

export function OrganizationProjectGrid({
  onOpenProject,
  projects,
}: {
  onOpenProject: (mod: Mod) => void;
  projects: OrganizationProjectPreview[];
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
      {projects.map((project) => {
        const mod = organizationProjectToMod(project);
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
  );
}
