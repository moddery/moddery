import { Bell } from 'lucide-react';

export function NotificationEmptyState({
  filtered,
  onClear,
}: {
  filtered: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <Bell className="size-6 text-accent-icon" />
      <h2 className="mt-4 font-display text-lg font-bold text-ink">
        {filtered ? 'No matching notifications' : 'No notifications yet'}
      </h2>
      {filtered ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 inline-flex h-9 items-center rounded-lg border border-line px-3 text-sm font-bold text-ink transition-colors hover:bg-control-hover"
        >
          Clear filters
        </button>
      ) : (
        <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
          Updates about your account and projects will appear here.
        </p>
      )}
    </div>
  );
}
