import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  disableTwoFactor,
  enableTwoFactor,
  setupTwoFactor,
  type TwoFactorSetup,
} from '../../../lib/dashboard.ts';
import { DashboardField } from './shared.tsx';
import { CollapsiblePanel } from '../../ui/dashboard/index.ts';

type TwoFactorBusyAction = 'disable' | 'enable' | 'setup';

interface PreventableSubmitEvent {
  preventDefault: () => void;
}

export function TwoFactorPanel({
  enabled,
  onUpdated,
}: {
  enabled: boolean;
  onUpdated: () => Promise<void>;
}) {
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [code, setCode] = useState('');
  const [busyAction, setBusyAction] = useState<TwoFactorBusyAction | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [locallyEnabled, setLocallyEnabled] = useState(enabled);
  const busy = busyAction !== null;

  useEffect(() => {
    setLocallyEnabled(enabled);
  }, [enabled]);

  async function startSetup() {
    setBusyAction('setup');
    setMessage(null);

    try {
      setSetup(await setupTwoFactor());
      setMessage('Authenticator setup generated.');
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Two-factor setup failed',
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function submit(event: PreventableSubmitEvent) {
    event.preventDefault();
    const action = locallyEnabled ? 'disable' : 'enable';
    setBusyAction(action);
    setMessage(null);

    try {
      if (locallyEnabled) {
        await disableTwoFactor(code);
        setLocallyEnabled(false);
        setSetup(null);
        setMessage(twoFactorActionMessage('disable'));
      } else {
        await enableTwoFactor(code);
        setLocallyEnabled(true);
        setSetup(null);
        setMessage(twoFactorActionMessage('enable'));
      }
      setCode('');
      await onUpdated();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Two-factor update failed',
      );
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <CollapsiblePanel
      title="Two-factor authentication"
      description="Require a six-digit authenticator code when signing in."
      action={<ShieldCheck className="size-5 text-accent-icon" />}
      defaultOpen={true}
    >
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
          {busyAction === 'setup' ? 'Generating setup...' : 'Set up 2FA'}
        </button>
      )}

      {(locallyEnabled || setup !== null) && (
        <form
          onSubmit={(event) => void submit(event)}
          className="mt-4 grid gap-3"
        >
          <DashboardField
            disabled={busy}
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
              {twoFactorSubmitLabel(locallyEnabled, busyAction)}
            </button>
          </div>
        </form>
      )}

      {message && (
        <p className="mt-3 text-sm font-semibold text-muted">{message}</p>
      )}
    </CollapsiblePanel>
  );
}

export function twoFactorActionMessage(action: 'disable' | 'enable') {
  return action === 'enable'
    ? 'Two-factor authentication enabled.'
    : 'Two-factor authentication disabled.';
}

export function twoFactorSubmitLabel(
  locallyEnabled: boolean,
  busyAction: TwoFactorBusyAction | null,
) {
  if (busyAction === 'enable') {
    return 'Enabling 2FA...';
  }

  if (busyAction === 'disable') {
    return 'Disabling 2FA...';
  }

  return locallyEnabled ? 'Disable 2FA' : 'Enable 2FA';
}
