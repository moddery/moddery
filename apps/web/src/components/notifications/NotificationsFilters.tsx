import { SelectField, type SelectOption } from '../ui/Select.tsx';

export function NotificationsFilters({
  notificationCount,
  onTypeChange,
  onUnreadOnlyChange,
  totalHits,
  type,
  typeOptions,
  unreadOnly,
}: {
  notificationCount: number;
  onTypeChange: (value: string) => void;
  onUnreadOnlyChange: (value: boolean) => void;
  totalHits: number;
  type: string;
  typeOptions: SelectOption[];
  unreadOnly: boolean;
}) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3">
      <p className="text-sm font-semibold text-muted">
        Showing {notificationCount.toLocaleString('en-US')} of{' '}
        {totalHits.toLocaleString('en-US')} notifications
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onUnreadOnlyChange(!unreadOnly);
          }}
          className="inline-flex h-9 items-center rounded-lg border border-line px-3 text-sm font-bold text-ink transition-colors hover:bg-control-hover"
          aria-pressed={unreadOnly}
        >
          {unreadOnly ? 'Unread only' : 'All notifications'}
        </button>
        <SelectField
          ariaLabel="Filter by notification type"
          prefix="Type:"
          value={type}
          onValueChange={onTypeChange}
          options={typeOptions}
          align="end"
          className="h-9"
        />
      </div>
    </section>
  );
}
