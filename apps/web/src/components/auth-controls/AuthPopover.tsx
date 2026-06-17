import { Popover } from '@base-ui-components/react/popover';
import { type FormEvent } from 'react';

import { cn } from '../../lib/cn.ts';
import { type AuthMode } from './types.ts';
import { controlButton, fieldInput } from './styles.ts';

export function AuthPopover({
  busy,
  email,
  error,
  identifier,
  mode,
  onEmailChange,
  onIdentifierChange,
  onModeChange,
  onOpenChange,
  onPasswordChange,
  onSubmit,
  onUsernameChange,
  open,
  password,
  username,
}: {
  busy: boolean;
  email: string;
  error: string | null;
  identifier: string;
  mode: AuthMode;
  onEmailChange: (value: string) => void;
  onIdentifierChange: (value: string) => void;
  onModeChange: (mode: AuthMode) => void;
  onOpenChange: (open: boolean) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUsernameChange: (value: string) => void;
  open: boolean;
  password: string;
  username: string;
}) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger className={controlButton}>Sign in</Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner
          sideOffset={10}
          align="end"
          collisionPadding={12}
          className="z-50"
        >
          <Popover.Popup
            className={cn(
              'w-[calc(100vw-1.5rem)] max-w-xs origin-[var(--transform-origin)] rounded-xl border border-line bg-surface p-4 shadow-2xl outline-none',
              'transition-[opacity,transform] duration-150',
              'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
              'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            )}
          >
            <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg border border-line bg-control p-1">
              <button
                type="button"
                className={cn(
                  'h-8 rounded-md text-sm font-bold transition-colors',
                  mode === 'login'
                    ? 'bg-accent text-white'
                    : 'text-muted hover:text-ink',
                )}
                onClick={() => onModeChange('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={cn(
                  'h-8 rounded-md text-sm font-bold transition-colors',
                  mode === 'register'
                    ? 'bg-accent text-white'
                    : 'text-muted hover:text-ink',
                )}
                onClick={() => onModeChange('register')}
              >
                Register
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-2.5">
              {mode === 'register' && (
                <>
                  <input
                    className={fieldInput}
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                  />
                  <input
                    className={fieldInput}
                    placeholder="Username"
                    value={username}
                    onChange={(event) => onUsernameChange(event.target.value)}
                  />
                </>
              )}

              {mode === 'login' && (
                <input
                  className={fieldInput}
                  placeholder="Username or email"
                  value={identifier}
                  onChange={(event) => onIdentifierChange(event.target.value)}
                />
              )}

              <input
                className={fieldInput}
                placeholder="Password"
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
              />

              {error && (
                <p className="text-xs font-semibold text-error">{error}</p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="h-10 w-full rounded-md bg-accent text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mode === 'login' ? 'Login' : 'Create account'}
              </button>
            </form>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
