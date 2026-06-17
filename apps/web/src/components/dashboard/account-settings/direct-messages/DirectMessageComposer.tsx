import { type FormEvent } from 'react';

import { DashboardField } from '../shared.tsx';

export function DirectMessageComposer({
  body,
  onBodyChange,
  onSubmit,
  onUsernameChange,
  username,
}: {
  body: string;
  onBodyChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUsernameChange: (value: string) => void;
  username: string;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-3">
      <DashboardField
        required
        label="Username"
        placeholder="handle"
        value={username}
        onChange={onUsernameChange}
      />
      <label className="grid gap-1 text-sm font-bold text-ink md:col-span-2">
        Message
        <div className="flex gap-2">
          <input
            required
            value={body}
            placeholder="Write a message"
            onChange={(event) => onBodyChange(event.target.value)}
            className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
          />
          <button className="rounded-lg bg-accent px-4 text-sm font-extrabold text-accent-ink transition-colors hover:bg-accent-strong">
            Send
          </button>
        </div>
      </label>
    </form>
  );
}
