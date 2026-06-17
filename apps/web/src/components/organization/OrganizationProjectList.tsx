import {
  organizationProjectToMod,
  type OrganizationProfile,
} from '../../lib/organizations.ts';
import { type Mod } from '../../types.ts';
import { ModCard } from '../ModCard.tsx';

export function OrganizationProjectList({
  organization,
  onOpenProject,
}: {
  organization: OrganizationProfile;
  onOpenProject: (mod: Mod) => void;
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

      {organization.projects.length === 0 ? (
        <p className="py-8 text-sm text-muted">No public projects yet.</p>
      ) : (
        <OrganizationProjectGrid
          organization={organization}
          onOpenProject={onOpenProject}
        />
      )}
    </section>
  );
}

export function OrganizationProjectGrid({
  organization,
  onOpenProject,
}: {
  organization: OrganizationProfile;
  onOpenProject: (mod: Mod) => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
      {organization.projects.map((project) => {
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
