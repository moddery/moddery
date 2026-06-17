import { Bell } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { sendNotification } from '../../../lib/dashboard.ts';
import { DashboardField, nullableText } from './shared.tsx';

export function SendNotificationPanel() {
  const [username, setUsername] = useState('');
  const [type, setType] = useState('moderation');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [actionUrl, setActionUrl] = useState('/dashboard');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const notification = await sendNotification({
        actionUrl: nullableText(actionUrl),
        body: nullableText(body),
        title,
        type,
        username,
      });
      setMessage(`Sent ${notification.title} to ${username}.`);
      setTitle('');
      setBody('');
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Notification failed',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Send notification
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Queue a user notification and delivery records.
          </p>
        </div>
        <Bell className="size-5 text-accent-icon" />
      </div>
      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <DashboardField
            label="Username"
            value={username}
            onChange={setUsername}
            required
          />
          <DashboardField
            label="Type"
            value={type}
            onChange={setType}
            required
          />
          <DashboardField
            label="Action URL"
            value={actionUrl}
            onChange={setActionUrl}
          />
        </div>
        <DashboardField
          label="Title"
          value={title}
          onChange={setTitle}
          required
        />
        <label className="grid gap-1 text-sm font-bold text-ink">
          Body
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            className="rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send notification
          </button>
          {message && (
            <span className="text-sm font-semibold text-muted">{message}</span>
          )}
        </div>
      </form>
    </section>
  );
}
