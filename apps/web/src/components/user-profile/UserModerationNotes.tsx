import { useQuery } from '@tanstack/react-query';

import { hasAuthToken } from '../../lib/catalog.ts';
import {
  canUseModerationNotes,
  createUserModerationNote,
  fetchModerationViewer,
  fetchUserModerationNotes,
} from '../../lib/moderation.ts';
import { ModerationNotesPanel } from '../ModerationNotesPanel.tsx';

export function UserModerationNotes({ username }: { username: string }) {
  const viewerQuery = useQuery({
    enabled: hasAuthToken(),
    queryFn: ({ signal }) => fetchModerationViewer(signal),
    queryKey: ['moderation', 'viewer'],
    retry: false,
  });
  const enabled = canUseModerationNotes(viewerQuery.data);
  const notesQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchUserModerationNotes(username, signal),
    queryKey: ['moderation', 'user-notes', username],
  });

  if (!enabled) return null;

  return (
    <ModerationNotesPanel
      error={
        notesQuery.error instanceof Error ? notesQuery.error.message : null
      }
      loading={notesQuery.isLoading}
      notes={notesQuery.data}
      onCreate={async (body) => {
        await createUserModerationNote({ body, username });
        await notesQuery.refetch();
      }}
    />
  );
}
