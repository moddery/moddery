import { LayoutDashboard } from 'lucide-react';

export function DashboardNavButton({
  onDashboard,
}: {
  onDashboard: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Dashboard"
      onClick={onDashboard}
      className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
    >
      <LayoutDashboard className="size-4" />
      <span className="hidden sm:inline">Dashboard</span>
    </button>
  );
}
