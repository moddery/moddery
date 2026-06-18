export interface DashboardSectionNavItem {
  count?: number;
  id: string;
  label: string;
}

export function DashboardSectionNav({
  items,
}: {
  items: DashboardSectionNavItem[];
}) {
  return (
    <nav
      aria-label="Dashboard sections"
      className="sticky top-14 z-20 -mx-4 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6"
    >
      <div className="flex gap-2 overflow-x-auto">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.id)}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {item.label}
            {item.count !== undefined && (
              <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-xs font-extrabold text-muted tabular-nums">
                {item.count.toLocaleString('en-US')}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}
