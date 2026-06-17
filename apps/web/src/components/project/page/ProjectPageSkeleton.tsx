import { BackButton } from './BackButton.tsx';

export function ProjectPageSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <BackButton onBack={onBack} />
      <div className="mt-5 pb-2">
        <div className="flex gap-4">
          <div className="size-20 rounded-md bg-surface-2 sm:size-24" />
          <div className="flex-1">
            <div className="h-8 max-w-sm rounded-md bg-surface-2" />
            <div className="mt-3 h-4 max-w-2xl rounded-sm bg-surface-2" />
            <div className="mt-2 h-4 max-w-xl rounded-sm bg-surface-2" />
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-3">
          <div className="h-5 w-24 rounded-sm bg-surface-2" />
          <div className="h-4 rounded-sm bg-surface-2" />
          <div className="h-4 max-w-3xl rounded-sm bg-surface-2" />
          <div className="h-4 max-w-2xl rounded-sm bg-surface-2" />
        </div>
        <div className="hidden space-y-3 lg:block">
          <div className="h-10 rounded-lg bg-surface-2" />
          <div className="h-28 rounded-lg bg-surface-2" />
        </div>
      </div>
    </section>
  );
}
