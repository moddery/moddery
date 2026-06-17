import { type FormEvent } from 'react';

import { DashboardField } from '../shared.tsx';

export function ApiTokenCreateForm({
  busy,
  expiresInDays,
  message,
  name,
  scopes,
  onExpiresInDaysChange,
  onNameChange,
  onScopesChange,
  onSubmit,
}: {
  busy: boolean;
  expiresInDays: string;
  message: string | null;
  name: string;
  scopes: string;
  onExpiresInDaysChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onScopesChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_10rem]">
        <DashboardField
          label="Token name"
          value={name}
          onChange={onNameChange}
          required
        />
        <DashboardField
          label="Scopes"
          value={scopes}
          onChange={onScopesChange}
        />
        <DashboardField
          label="Expires in days"
          value={expiresInDays}
          onChange={onExpiresInDaysChange}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          Create token
        </button>
        {message && (
          <span className="text-sm font-semibold text-muted">{message}</span>
        )}
      </div>
    </form>
  );
}
