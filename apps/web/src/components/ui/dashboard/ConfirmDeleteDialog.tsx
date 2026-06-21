import { AlertDialog } from '@base-ui-components/react/alert-dialog';
import { useState } from 'react';

import { cn } from '../../../lib/cn.ts';

/**
 * Type-to-confirm destructive action dialog. The delete button stays disabled
 * until the user types the exact confirmation phrase (the item name).
 */
export function ConfirmDeleteDialog({
  confirmPhrase,
  description,
  onConfirm,
  onOpenChange,
  open,
  title,
}: {
  confirmPhrase: string;
  description: string;
  onConfirm: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = typed.trim() === confirmPhrase.trim();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setTyped('');
      setError(null);
      setBusy(false);
    }
    onOpenChange(next);
  }

  async function confirm() {
    if (!matches || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      handleOpenChange(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Delete failed');
      setBusy(false);
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop
          className={cn(
            'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-150',
            'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
          )}
        />
        <AlertDialog.Popup
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-xl border border-line bg-surface p-5 shadow-2xl outline-none',
            'transition-[opacity,transform] duration-150',
            'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
          )}
        >
          <AlertDialog.Title className="font-display text-lg font-extrabold text-ink">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1 text-sm leading-6 text-muted">
            {description}
          </AlertDialog.Description>

          <label className="mt-4 grid gap-1 text-sm font-bold text-ink">
            Type <span className="text-danger">{confirmPhrase}</span> to confirm
            <input
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-danger"
            />
          </label>

          {error && (
            <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
              {error}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Close className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover">
              Cancel
            </AlertDialog.Close>
            <button
              type="button"
              disabled={!matches || busy}
              onClick={() => void confirm()}
              className="inline-flex h-10 items-center rounded-lg bg-danger px-4 text-sm font-bold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export function confirmDeleteMatches(
  typed: string,
  confirmPhrase: string,
): boolean {
  return typed.trim() === confirmPhrase.trim();
}
