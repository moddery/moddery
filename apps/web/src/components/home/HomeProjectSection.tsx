import { type Mod } from '../../types.ts';
import { ModCard, type SearchTag } from '../ModCard.tsx';
import { ProjectRowSkeleton } from './ProjectRowSkeleton.tsx';

export function HomeProjectSection({
  title,
  subtitle,
  projects,
  loading,
  onOpenProject,
  onTagSearch,
}: {
  title: string;
  subtitle: string;
  projects: Mod[];
  loading: boolean;
  onOpenProject: (mod: Mod) => void;
  onTagSearch: (tag: SearchTag) => void;
}) {
  return (
    <section>
      <div className="flex flex-col gap-1 border-b border-line pb-3">
        <h2 className="font-display text-xl font-extrabold text-ink">
          {title}
        </h2>
        <p className="text-sm leading-6 text-muted">{subtitle}</p>
      </div>

      {loading ? (
        <ProjectRowSkeleton />
      ) : projects.length === 0 ? (
        <p className="py-8 text-sm text-muted">No projects to show yet.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {projects.map((project) => (
            <ModCard
              key={`${project.projectType}-${project.slug}`}
              layout="list"
              mod={project}
              onOpen={onOpenProject}
              onTagSearch={onTagSearch}
            />
          ))}
        </div>
      )}
    </section>
  );
}
