import { type ProjectDetails } from '../../../lib/catalog.ts';
import { enumLabel } from '../../../lib/labels.ts';
import { ExternalLink } from './ExternalLink.tsx';

export function ProjectLinksSection({ project }: { project: ProjectDetails }) {
  const standardLinks = [
    { href: project.sourceUrl, label: 'Source' },
    { href: project.issuesUrl, label: 'Issues' },
    { href: project.wikiUrl, label: 'Wiki' },
    { href: project.discordUrl, label: 'Discord' },
    {
      href: project.license.url,
      label: `License (${project.license.id})`,
    },
  ].filter((link): link is { href: string; label: string } =>
    Boolean(link.href),
  );

  if (
    standardLinks.length === 0 &&
    project.donationUrls.length === 0 &&
    project.externalLinks.length === 0
  ) {
    return null;
  }

  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-extrabold text-ink">Links</h2>
      <div className="mt-3 flex flex-col gap-1">
        {standardLinks.map((link) => (
          <ExternalLink key={link.label} href={link.href}>
            {link.label}
          </ExternalLink>
        ))}
        {project.donationUrls.map((link) => (
          <ExternalLink key={link.id} href={link.url}>
            {link.platform}
          </ExternalLink>
        ))}
        {project.externalLinks.map((link) => (
          <ExternalLink key={link.id} href={link.url}>
            {enumLabel(link.label)}
          </ExternalLink>
        ))}
      </div>
    </section>
  );
}
