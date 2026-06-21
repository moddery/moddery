import { useState, type ReactNode } from 'react';

import { cn } from '../../../lib/cn.ts';
import { DashboardDialog } from './Dialog.tsx';

export interface WizardStep<TCtx> {
  id: string;
  title: string;
  validate?: (context: TCtx) => string | null;
  render: (context: TCtx) => ReactNode;
}

export interface MultiStepDialogProps<TCtx> {
  context: TCtx;
  description?: ReactNode;
  onComplete: (context: TCtx) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  steps: WizardStep<TCtx>[];
  submitLabel?: string;
  title: ReactNode;
}

export function MultiStepDialog<TCtx>({
  context,
  description,
  onComplete,
  onOpenChange,
  open,
  steps,
  submitLabel = 'Submit',
  title,
}: MultiStepDialogProps<TCtx>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeIndex = Math.min(activeIndex, steps.length - 1);
  const activeStep = steps[safeIndex];
  const isLastStep = safeIndex === steps.length - 1;

  if (!activeStep) return null;
  const step = activeStep;

  function reset() {
    setActiveIndex(0);
    setError(null);
    setSubmitting(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function goBack() {
    setError(null);
    setActiveIndex((index) => Math.max(0, index - 1));
  }

  function goNext() {
    const stepError = wizardStepError(step, context);
    if (stepError !== null) {
      setError(stepError);
      return;
    }
    setError(null);
    setActiveIndex((index) => wizardNextIndex(index, steps.length));
  }

  async function submit() {
    const stepError = wizardStepError(step, context);
    if (stepError !== null) {
      setError(stepError);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onComplete(context);
      reset();
      onOpenChange(false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Something went wrong',
      );
      setSubmitting(false);
    }
  }

  return (
    <DashboardDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-faint">
            Step {safeIndex + 1} of {steps.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              disabled={safeIndex === 0 || submitting}
              className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-sm font-bold text-ink transition-colors hover:border-line-strong hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>
            {isLastStep ? (
              <button
                type="button"
                onClick={() => void submit()}
                disabled={submitting}
                className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {wizardSubmitLabel(submitting, submitLabel)}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={submitting}
                className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            )}
          </div>
        </div>
      }
    >
      <ol className="mb-5 flex items-center gap-2" aria-hidden>
        {steps.map((progressStep, index) => (
          <li
            key={progressStep.id}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              index <= safeIndex ? 'bg-accent' : 'bg-surface-2',
            )}
          />
        ))}
      </ol>

      <p className="mb-4 font-display text-sm font-extrabold text-ink">
        {activeStep.title}
      </p>

      {activeStep.render(context)}

      {error && (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      )}
    </DashboardDialog>
  );
}

export function wizardStepError<TCtx>(
  step: WizardStep<TCtx>,
  context: TCtx,
): string | null {
  return step.validate ? step.validate(context) : null;
}

export function wizardCanAdvance<TCtx>(
  step: WizardStep<TCtx>,
  context: TCtx,
): boolean {
  return wizardStepError(step, context) === null;
}

export function wizardNextIndex(current: number, total: number): number {
  return Math.min(current + 1, total - 1);
}

export function wizardSubmitLabel(submitting: boolean, label: string): string {
  return submitting ? 'Working…' : label;
}
