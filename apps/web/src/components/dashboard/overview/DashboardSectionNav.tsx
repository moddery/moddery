import { cn } from '../../../lib/cn.ts';
import {
  type DashboardSectionId,
  type DashboardSectionNavItem,
} from './dashboardSectionItems.ts';

export function DashboardSectionNav({
  activeId,
  items,
  onSelect,
}: {
  activeId: DashboardSectionId;
  items: DashboardSectionNavItem[];
  onSelect: (id: DashboardSectionId) => void;
}) {
  return (
    <nav
      aria-label="Dashboard sections"
      className={cn(
        // Mobile: sticky horizontal strip. Desktop: sticky vertical sidebar.
        'sticky top-14 z-20 -mx-4 mb-5 flex gap-2 overflow-x-auto border-b border-line bg-bg/95 px-4 py-3 backdrop-blur',
        'sm:-mx-6 sm:px-6',
        'lg:top-20 lg:mx-0 lg:mb-0 lg:w-60 lg:shrink-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      )}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        const Icon = item.icon;
        return (
          <button
            type="button"
            key={item.id}
            aria-current={active ? 'page' : undefined}
            onClick={() => onSelect(item.id)}
            className={cn(
              'inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent lg:h-10 lg:w-full lg:justify-start',
              active
                ? 'border-accent-soft bg-accent-soft text-accent'
                : 'border-line bg-control text-ink hover:border-line-strong hover:bg-control-hover lg:border-transparent lg:bg-transparent lg:text-muted lg:hover:bg-control lg:hover:text-ink',
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="lg:flex-1 lg:text-left">{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cn(
                  'rounded-md px-1.5 py-0.5 text-xs font-extrabold tabular-nums',
                  active
                    ? 'bg-accent/15 text-accent'
                    : 'bg-surface-2 text-muted',
                )}
              >
                {item.count.toLocaleString('en-US')}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
