import { ChevronLeft } from 'lucide-react';

export function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex h-9 items-center gap-2 rounded-lg bg-control px-3 text-sm font-bold text-ink transition-colors hover:bg-control-hover"
    >
      <ChevronLeft className="size-4 text-accent-icon" />
      Back to results
    </button>
  );
}
