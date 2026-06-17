import { type Mod } from '../types.ts';
import { OrganizationDetail } from './organization/OrganizationDetail.tsx';
import { OrganizationDirectory } from './organization/OrganizationDirectory.tsx';

export function OrganizationPage({
  slug,
  onOpenProject,
}: {
  slug: string | null;
  onOpenProject: (mod: Mod) => void;
}) {
  if (slug === null) {
    return <OrganizationDirectory onOpenProject={onOpenProject} />;
  }

  return <OrganizationDetail slug={slug} onOpenProject={onOpenProject} />;
}
