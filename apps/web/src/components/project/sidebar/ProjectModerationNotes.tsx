import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { hasAuthToken } from '../../../lib/catalog.ts';
import {
  canUseModerationNotes,
  createProjectModerationNote,
  fetchModerationViewer,
  fetchProjectModerationActionSearch,
  fetchProjectModerationNoteSearch,
} from '../../../lib/moderation.ts';
import { ModerationNotesPanel } from '../../ModerationNotesPanel.tsx';
import { ModerationActionsPanel } from './moderation-notes/ModerationActionsPanel.tsx';

const notePageSize = 20;
const actionPageSize = 10;

export function ProjectModerationNotes({
  projectSlug,
}: {
  projectSlug: string;
}) {
  const [actionsPage, setActionsPage] = useState(1);
  const [notesPage, setNotesPage] = useState(1);
  const viewerQuery = useQuery({
    enabled: hasAuthToken(),
    queryFn: ({ signal }) => fetchModerationViewer(signal),
    queryKey: ['moderation', 'viewer'],
    retry: false,
  });
  const enabled = canUseModerationNotes(viewerQuery.data);
  const notesQuery = useQuery({
    enabled,
    queryFn: ({ signal }) =>
      fetchProjectModerationNoteSearch(
        projectSlug,
        notesPage,
        notePageSize,
        signal,
      ),
    queryKey: ['moderation', 'project-notes', projectSlug, notesPage],
  });
  const actionsQuery = useQuery({
    enabled,
    queryFn: ({ signal }) =>
      fetchProjectModerationActionSearch(
        projectSlug,
        actionsPage,
        actionPageSize,
        signal,
      ),
    queryKey: ['moderation', 'project-actions', projectSlug, actionsPage],
  });

  if (!enabled) return null;

  return (
    <div className="grid gap-4">
      <ModerationActionsPanel
        actions={actionsQuery.data?.actions}
        error={
          actionsQuery.error instanceof Error
            ? actionsQuery.error.message
            : null
        }
        loading={actionsQuery.isLoading}
        onPage={setActionsPage}
        page={actionsPage}
        totalHits={actionsQuery.data?.totalHits ?? 0}
        totalPages={Math.max(
          1,
          Math.ceil((actionsQuery.data?.totalHits ?? 0) / actionPageSize),
        )}
      />
      <ModerationNotesPanel
        error={
          notesQuery.error instanceof Error ? notesQuery.error.message : null
        }
        loading={notesQuery.isLoading}
        notes={notesQuery.data?.notes}
        onCreate={async (body) => {
          await createProjectModerationNote({ body, projectSlug });
          setNotesPage(1);
          await notesQuery.refetch();
        }}
        onPage={setNotesPage}
        page={notesPage}
        totalHits={notesQuery.data?.totalHits ?? 0}
        totalPages={Math.max(
          1,
          Math.ceil((notesQuery.data?.totalHits ?? 0) / notePageSize),
        )}
      />
    </div>
  );
}
