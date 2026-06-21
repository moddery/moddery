import { Dialog } from '@base-ui-components/react/dialog';
import { X } from 'lucide-react';
import { type ReactNode } from 'react';

import { cn } from '../../../lib/cn.ts';

export function DashboardDialog({
  children,
  description,
  footer,
  onOpenChange,
  open,
  size = 'lg',
  title,
}: {
  children: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  size?: 'md' | 'lg';
  title: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm',
            'transition-opacity duration-150',
            'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
          )}
        />
        <Dialog.Popup
          className={cn(
            'fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-1.5rem)] -translate-x-1/2 -translate-y-1/2 flex-col',
            'origin-center rounded-xl border border-line bg-surface shadow-2xl outline-none',
            'transition-[opacity,transform] duration-150',
            'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            size === 'md' ? 'max-w-md' : 'max-w-2xl',
          )}
        >
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="font-display text-lg font-extrabold text-ink">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm leading-6 text-muted">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-muted outline-none transition-colors hover:bg-control-hover hover:text-ink focus-visible:outline-none"
            >
              <X className="size-4" />
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {children}
          </div>

          {footer && (
            <footer className="border-t border-line px-5 py-4">{footer}</footer>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
