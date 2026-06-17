import { type ReactNode } from 'react';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

export function ExternalLink({
  href,
  children,
}: {
  href: string | null;
  children: ReactNode;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm font-semibold text-muted no-underline transition-colors hover:bg-control-hover hover:text-ink"
    >
      {children}
      <ExternalLinkIcon className="size-3.5 text-accent-icon" />
    </a>
  );
}
