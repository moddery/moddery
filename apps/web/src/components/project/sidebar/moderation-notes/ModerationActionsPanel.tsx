import { formatDate } from '../../../../lib/format.ts';
import { type fetchProjectModerationActionSearch } from '../../../../lib/moderation.ts';
import { Pagination } from '../../../Pagination.tsx';

type ModerationActions = Awaited<
  ReturnType<typeof fetchProjectModerationActionSearch>
>['actions'];

export function ModerationActionsPanel({
  actions,
  error,
  loading,
  onPage,
  page,
  totalHits,
  totalPages,
}: {
  actions: ModerationActions | undefined;
  error: string | null;
  loading: boolean;
  onPage: (page: number) => void;
  page: number;
  totalHits: number;
  totalPages: number;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-base font-extrabold text-ink">
          Moderation history
        </h2>
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted">
          {totalHits.toLocaleString('en-US')} actions
        </span>
      </div>
      {totalPages > 1 && (
        <div className="mt-3">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
      {error && (
        <p className="mt-3 text-sm font-semibold text-danger">{error}</p>
      )}
      {loading && <p className="mt-3 text-sm text-muted">Loading actions...</p>}
      {!loading && !error && actions?.length === 0 && (
        <p className="mt-3 text-sm text-muted">No moderation actions yet.</p>
      )}
      {actions && actions.length > 0 && (
        <div className="mt-3 grid gap-2">
          {actions.map((action) => (
            <div
              key={action.id}
              className="rounded-lg border border-line bg-raised px-3 py-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-extrabold text-ink">
                  {formatModerationAction(action.kind)}
                </p>
                <time className="text-xs font-semibold text-muted">
                  {formatDate(action.createdAt)}
                </time>
              </div>
              <p className="mt-1 text-xs font-semibold text-muted">
                {action.moderator.displayName ?? action.moderator.username}
              </p>
              {action.reason && (
                <p className="mt-2 text-sm leading-6 text-muted">
                  {action.reason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-3">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
    </section>
  );
}

function formatModerationAction(kind: string): string {
  const labels: Record<string, string> = {
    APPROVE: 'Approved',
    ARCHIVE: 'Archived',
    REJECT: 'Rejected',
    RESTORE: 'Restored',
  };

  return labels[kind] ?? kind;
}
