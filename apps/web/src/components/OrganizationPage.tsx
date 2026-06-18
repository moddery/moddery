import { type Mod } from '../types.ts';
import { type SearchTag } from './ModCard.tsx';
import { OrganizationDetail } from './organization/OrganizationDetail.tsx';
import { OrganizationDirectory } from './organization/OrganizationDirectory.tsx';

export function OrganizationPage({
  slug,
  onOpenProject,
  onTagSearch,
}: {
  slug: string | null;
  onOpenProject: (mod: Mod) => void;
  onTagSearch?: (tag: SearchTag) => void;
}) {
  if (slug === null) {
    return (
      <OrganizationDirectory
        onOpenProject={onOpenProject}
        onTagSearch={onTagSearch}
      />
    );
  }

  return (
    <OrganizationDetail
      slug={slug}
      onOpenProject={onOpenProject}
      onTagSearch={onTagSearch}
    />
  );
}
