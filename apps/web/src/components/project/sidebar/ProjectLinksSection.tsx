import { type ProjectDetails } from '../../../lib/catalog.ts';
import { ExternalLink } from './ExternalLink.tsx';

export function ProjectLinksSection({ project }: { project: ProjectDetails }) {
  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-extrabold text-ink">Links</h2>
      <div className="mt-3 flex flex-col gap-1">
        <ExternalLink href={project.source_url}>Source</ExternalLink>
        <ExternalLink href={project.issues_url}>Issues</ExternalLink>
        <ExternalLink href={project.wiki_url}>Wiki</ExternalLink>
        <ExternalLink href={project.discord_url}>Discord</ExternalLink>
        {project.donation_urls.map((link) => (
          <ExternalLink key={link.id} href={link.url}>
            {link.platform}
          </ExternalLink>
        ))}
      </div>
    </section>
  );
}
