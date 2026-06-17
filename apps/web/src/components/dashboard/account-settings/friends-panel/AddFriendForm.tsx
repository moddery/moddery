import { type FormEvent, useState } from 'react';

import { DashboardField } from '../shared.tsx';

export function AddFriendForm({
  busyUsername,
  onRequestFriend,
}: {
  busyUsername: string | null;
  onRequestFriend: (username: string) => Promise<unknown>;
}) {
  const [username, setUsername] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedUsername = username.trim();
    if (trimmedUsername.length === 0) {
      return;
    }

    await onRequestFriend(trimmedUsername);
    setUsername('');
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="mt-4 flex max-w-xl gap-2"
    >
      <div className="min-w-0 flex-1">
        <DashboardField
          required
          label="Add friend"
          placeholder="username"
          value={username}
          onChange={setUsername}
        />
      </div>
      <button
        type="submit"
        disabled={busyUsername === username.trim()}
        className="mt-6 rounded-lg bg-accent px-4 text-sm font-extrabold text-accent-ink transition-colors hover:bg-accent-strong disabled:cursor-wait disabled:opacity-60"
      >
        Add
      </button>
    </form>
  );
}
