import { cn } from '../../lib/cn.ts';

interface PrimaryNavItem {
  active: boolean;
  href: string;
  label: string;
  onClick: () => void;
}

function PrimaryNavLink({ active, href, label, onClick }: PrimaryNavItem) {
  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
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

export function PrimaryNav({ items }: { items: readonly PrimaryNavItem[] }) {
  return (
    <nav className="ml-2 hidden items-center gap-1 lg:flex">
      {items.map((item) => (
        <PrimaryNavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}
