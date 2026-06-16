import { useState, type FormEvent } from 'react';

import { timeAgo } from '../lib/format.ts';
import type { ModerationNote } from '../lib/moderation.ts';

export function ModerationNotesPanel({
  error,
  loading,
  notes,
  onCreate,
}: {
  error: string | null;
  loading: boolean;
  notes: ModerationNote[] | undefined;
  onCreate: (body: string) => Promise<void>;
}) {
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      await onCreate(body);
      setBody('');
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Note failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 border-t border-line pt-5">
      <h2 className="font-display text-base font-extrabold text-ink">
        Moderation notes
      </h2>
      {loading ? (
        <p className="mt-2 text-sm font-semibold text-muted">
          Loading notes...
        </p>
      ) : error ? (
        <p className="mt-2 rounded-md bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      ) : notes === undefined ? (
        <p className="mt-2 rounded-md bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          Moderation notes did not return from the API.
        </p>
      ) : notes.length === 0 ? (
        <p className="mt-2 text-sm font-semibold text-muted">No notes yet.</p>
      ) : (
        <div className="mt-3 grid gap-2">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg bg-control px-3 py-2">
              <p className="text-sm leading-6 text-ink">{note.body}</p>
              <p className="mt-1 text-xs font-bold text-muted">
                {note.author.displayName ?? note.author.username} ·{' '}
                {timeAgo(note.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-3 grid gap-2"
      >
        <textarea
          required
          minLength={2}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="min-h-20 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent"
          placeholder="Add a private moderation note"
        />
        {message && (
          <p className="rounded-md bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {message}
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Saving...' : 'Add note'}
          </button>
        </div>
      </form>
    </section>
  );
}
