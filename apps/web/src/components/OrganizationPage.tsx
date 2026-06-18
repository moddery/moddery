import { type Mod } from '../types.ts';
import { type SearchTag } from './ModCard.tsx';
import { OrganizationDetail } from './organization/OrganizationDetail.tsx';
import { OrganizationDirectory } from './organization/OrganizationDirectory.tsx';

export function OrganizationPage({
  slug,
  onHome,
  onOrganizations,
  onOpenProject,
  onTagSearch,
}: {
  slug: string | null;
  onHome: () => void;
  onOrganizations: () => void;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  if (slug === null) {
    return (
      <OrganizationDirectory
        onHome={onHome}
        onOpenProject={onOpenProject}
        onTagSearch={onTagSearch}
      />
    );
  }

  return (
    <OrganizationDetail
      slug={slug}
      onBack={onOrganizations}
      onOpenProject={onOpenProject}
      onTagSearch={onTagSearch}
    />
  );
}
