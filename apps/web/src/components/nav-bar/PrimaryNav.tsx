import { cn } from '../../lib/cn.ts';

interface PrimaryNavItem {
  active: boolean;
  href: string;
  label: string;
}

function PrimaryNavLink({ active, href, label }: PrimaryNavItem) {
  return (
    <a
      href={href}
      className={cn(
        'border-b px-2.5 py-1.5 text-sm font-semibold transition-colors hover:border-accent-icon hover:text-ink',
        active
          ? 'border-accent-icon text-ink'
          : 'border-transparent text-muted',
      )}
    >
      {label}
    </a>
  );
}

export function PrimaryNav({
  items,
  variant = 'desktop',
}: {
  items: readonly PrimaryNavItem[];
  variant?: 'desktop' | 'mobile';
}) {
  return (
    <nav
      className={cn(
        variant === 'desktop'
          ? 'ml-2 hidden items-center gap-1 lg:flex'
          : 'mx-auto flex w-full max-w-[1280px] gap-1 overflow-x-auto px-4 pb-2 sm:px-6 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      )}
      aria-label={variant === 'desktop' ? 'Primary' : 'Primary mobile'}
    >
      {items.map((item) => (
        <PrimaryNavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}
