import { LockKeyhole } from 'lucide-react';
import { type ReactNode } from 'react';

import { useAuthTokenPresent } from '../lib/users/auth.ts';

export function AuthRequiredPage({
  children,
  description,
  onRequestAuth,
  title,
}: {
  children: ReactNode;
  description: string;
  onRequestAuth: () => void;
  title: string;
}) {
  const authenticated = useAuthTokenPresent();

  if (authenticated) return children;

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-[720px] items-center px-4 py-16 sm:px-6">
      <section className="w-full rounded-lg border border-line bg-surface p-6 text-center">
        <div className="mx-auto grid size-11 place-items-center rounded-lg bg-accent-soft text-accent-icon">
          <LockKeyhole className="size-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-ink">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
          {description}
        </p>
        <button
          type="button"
          onClick={onRequestAuth}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
        >
          Sign in
        </button>
      </section>
    </main>
  );
}
