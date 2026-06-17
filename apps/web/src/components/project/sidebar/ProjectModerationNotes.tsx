import { useQuery } from '@tanstack/react-query';

import { hasAuthToken } from '../../../lib/catalog.ts';
import { formatDate } from '../../../lib/format.ts';
import {
  canUseModerationNotes,
  createProjectModerationNote,
  fetchModerationViewer,
  fetchProjectModerationActions,
  fetchProjectModerationNotes,
} from '../../../lib/moderation.ts';
import { ModerationNotesPanel } from '../../ModerationNotesPanel.tsx';

function formatModerationAction(kind: string): string {
  const labels: Record<string, string> = {
    APPROVE: 'Approved',
    ARCHIVE: 'Archived',
    REJECT: 'Rejected',
    RESTORE: 'Restored',
  };

  return labels[kind] ?? kind;
}

export function ProjectModerationNotes({
  projectSlug,
}: {
  projectSlug: string;
}) {
  const viewerQuery = useQuery({
    enabled: hasAuthToken(),
    queryFn: ({ signal }) => fetchModerationViewer(signal),
    queryKey: ['moderation', 'viewer'],
    retry: false,
  });
  const enabled = canUseModerationNotes(viewerQuery.data);
  const notesQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchProjectModerationNotes(projectSlug, signal),
    queryKey: ['moderation', 'project-notes', projectSlug],
  });
  const actionsQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchProjectModerationActions(projectSlug, signal),
    queryKey: ['moderation', 'project-actions', projectSlug],
  });

  if (!enabled) return null;

  return (
    <div className="grid gap-4">
      <ModerationActionsPanel
        actions={actionsQuery.data}
        error={
          actionsQuery.error instanceof Error
            ? actionsQuery.error.message
            : null
        }
        loading={actionsQuery.isLoading}
      />
      <ModerationNotesPanel
        error={
          notesQuery.error instanceof Error ? notesQuery.error.message : null
        }
        loading={notesQuery.isLoading}
        notes={notesQuery.data}
        onCreate={async (body) => {
          await createProjectModerationNote({ body, projectSlug });
          await notesQuery.refetch();
        }}
      />
    </div>
  );
}

function ModerationActionsPanel({
  actions,
  error,
  loading,
}: {
  actions:
    | Awaited<ReturnType<typeof fetchProjectModerationActions>>
    | undefined;
  error: string | null;
  loading: boolean;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-base font-extrabold text-ink">
          Moderation history
        </h2>
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted">
          {actions?.length ?? 0} actions
        </span>
      </div>
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
    </section>
  );
}
