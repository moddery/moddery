import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  canUseModerationNotes,
  createUserModerationNote,
  fetchModerationViewer,
  fetchUserModerationNoteSearch,
} from '../../lib/moderation.ts';
import { useAuthTokenPresent } from '../../lib/users/auth.ts';
import { ModerationNotesPanel } from '../ModerationNotesPanel.tsx';

const notePageSize = 20;

export function UserModerationNotes({ username }: { username: string }) {
  const [notesPage, setNotesPage] = useState(1);
  const authenticated = useAuthTokenPresent();
  const viewerQuery = useQuery({
    enabled: authenticated,
    queryFn: ({ signal }) => fetchModerationViewer(signal),
    queryKey: ['moderation', 'viewer'],
    retry: false,
  });
  const enabled = canUseModerationNotes(viewerQuery.data);
  const notesQuery = useQuery({
    enabled,
    queryFn: ({ signal }) =>
      fetchUserModerationNoteSearch(username, notesPage, notePageSize, signal),
    queryKey: ['moderation', 'user-notes', username, notesPage],
  });

  if (!enabled) return null;

  return (
    <ModerationNotesPanel
      error={
        notesQuery.error instanceof Error ? notesQuery.error.message : null
      }
      loading={notesQuery.isLoading}
      notes={notesQuery.data?.notes}
      onCreate={async (body) => {
        await createUserModerationNote({ body, username });
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
  );
}
