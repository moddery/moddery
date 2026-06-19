import { ShieldCheck } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import {
  disableTwoFactor,
  enableTwoFactor,
  setupTwoFactor,
  type TwoFactorSetup,
} from '../../../lib/dashboard.ts';
import { DashboardField } from './shared.tsx';

export function TwoFactorPanel({
  enabled,
  onUpdated,
}: {
  enabled: boolean;
  onUpdated: () => Promise<void>;
}) {
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [locallyEnabled, setLocallyEnabled] = useState(enabled);

  async function startSetup() {
    setBusy(true);
    setMessage(null);

    try {
      setSetup(await setupTwoFactor());
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Two-factor setup failed',
      );
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      if (locallyEnabled) {
        await disableTwoFactor(code);
        setLocallyEnabled(false);
        setSetup(null);
        setMessage('Two-factor authentication disabled.');
      } else {
        await enableTwoFactor(code);
        setLocallyEnabled(true);
        setSetup(null);
        setMessage('Two-factor authentication enabled.');
      }
      setCode('');
      await onUpdated();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Two-factor update failed',
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
            Two-factor authentication
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Require a six-digit authenticator code when signing in.
          </p>
        </div>
        <ShieldCheck className="size-5 text-accent-icon" />
      </div>

      <div className="mt-4 rounded-lg border border-line bg-control p-4">
        <p className="text-sm font-bold text-ink">
          Status: {locallyEnabled ? 'enabled' : 'disabled'}
        </p>
        {setup && (
          <div className="mt-3 grid gap-2 text-sm text-muted">
            <p>
              Secret:{' '}
              <span className="font-mono text-xs font-bold text-ink">
                {setup.secret}
              </span>
            </p>
            <p className="break-all font-mono text-xs">{setup.otpAuthUrl}</p>
          </div>
        )}
      </div>

      {!locallyEnabled && setup === null && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void startSetup()}
          className="mt-4 h-10 rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          Set up 2FA
        </button>
      )}

      {(locallyEnabled || setup !== null) && (
        <form
          onSubmit={(event) => void submit(event)}
          className="mt-4 grid gap-3"
        >
          <DashboardField
            label="Authenticator code"
            value={code}
            onChange={setCode}
            placeholder="123456"
            required
          />
          <div>
            <button
              type="submit"
              disabled={busy}
              className="h-10 rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {locallyEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>
        </form>
      )}

      {message && (
        <p className="mt-3 text-sm font-semibold text-muted">{message}</p>
      )}
    </section>
  );
}
