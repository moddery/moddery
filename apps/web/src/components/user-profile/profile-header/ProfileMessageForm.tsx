import { MessageCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import {
  createUserDirectThread,
  hasAuthToken,
  type PublicUserProfile,
} from '../../../lib/users.ts';

export function ProfileMessageForm({
  profile,
}: {
  profile: PublicUserProfile;
}) {
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasAuthToken()) {
      setMessage('Sign in to send messages.');
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      await createUserDirectThread({
        body,
        username: profile.username,
      });
      setBody('');
      setMessage('Message sent.');
      setOpen(false);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Message failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-control px-2.5 text-xs font-bold text-ink transition-colors hover:bg-control-hover"
      >
        <MessageCircle className="size-3.5 text-accent-icon" />
        Message
      </button>

      {open && (
        <form
          onSubmit={(event) => void submitMessage(event)}
          className="mt-1 flex w-full basis-full gap-2"
        >
          <input
            required
            minLength={2}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={`Message ${profile.displayName ?? profile.username}`}
            className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-accent px-4 text-sm font-extrabold text-accent-ink transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </form>
      )}

      {message && (
        <p className="w-full basis-full text-xs font-semibold text-muted">
          {message}
        </p>
      )}
    </>
  );
}
