import { type ProjectType } from '../types.ts';
import { type SearchTag } from './ModCard.tsx';
import { BackButton } from './project/page/BackButton.tsx';
import { ProjectHero } from './project/page/ProjectHero.tsx';
import { ProjectPageContent } from './project/page/ProjectPageContent.tsx';
import { ProjectPageSkeleton } from './project/page/ProjectPageSkeleton.tsx';
import { useProjectPageState } from './project/page/useProjectPageState.ts';

interface ProjectPageProps {
  slug: string;
  projectTypeHint: ProjectType;
  onBack: () => void;
  onTagSearch?: (tag: SearchTag) => void;
}

export function ProjectPage({
  slug,
  projectTypeHint,
  onBack,
  onTagSearch,
}: ProjectPageProps) {
  const page = useProjectPageState({ projectTypeHint, slug });

  if (page.projectQuery.isLoading)
    return <ProjectPageSkeleton onBack={onBack} />;

  if (page.error || !page.project) {
    return (
      <section className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
        <BackButton onBack={onBack} />
        <div className="mt-5 py-8">
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Project not found
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            {page.error ??
              'The catalog did not return a project for this page.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <BackButton onBack={onBack} />
      <ProjectHero
        categories={page.categories}
        onTagSearch={onTagSearch}
        project={page.project}
        projectType={page.projectType}
      />
      <ProjectPageContent
        activeTab={page.activeTab}
        analytics={page.analytics}
        changelogVersions={page.changelogVersions}
        followState={page.followState}
        gallery={page.gallery}
        latestFile={page.latestFile}
        members={page.members}
        onDownloadLatest={() => void page.downloadLatestFile()}
        onSelectTab={page.selectTab}
        onSelectVersion={page.selectVersion}
        project={page.project}
        selectedVersion={page.selectedVersion}
        supportedVersions={page.supportedVersions}
        versions={page.versions}
      />
    </section>
  );
}
