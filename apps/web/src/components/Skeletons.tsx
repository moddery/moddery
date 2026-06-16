import { cn } from '../lib/cn.ts';
import type { Layout } from './ModCard.tsx';

function Bar({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-sm bg-surface-2', className)} />;
}

function ChipBar({ className }: { className?: string }) {
  return (
    <div className={cn('skeleton h-6 rounded-md bg-surface-2', className)} />
  );
}

export function ModCardSkeleton({ layout }: { layout: Layout }) {
  if (layout === 'grid') {
    return (
      <div className="border-b border-line px-2 py-4">
        <div className="flex items-center gap-3">
          <div className="size-[52px] shrink-0 rounded-md bg-surface-2" />
          <div className="flex-1">
            <Bar className="h-4 w-28" />
            <Bar className="mt-2 h-3 w-20" />
          </div>
        </div>
        <Bar className="mt-4 h-3.5 w-full" />
        <Bar className="mt-1.5 h-3.5 w-3/4" />
        <div className="mt-4 flex gap-1.5">
          <ChipBar className="w-24" />
          <ChipBar className="w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-line px-2 py-4">
      <div className="flex gap-4">
        <div className="size-16 shrink-0 rounded-md bg-surface-2 sm:size-20" />
        <div className="min-w-0 flex-1">
          <Bar className="h-5 w-44" />
          <Bar className="mt-2.5 h-3.5 w-full max-w-md" />
          <Bar className="mt-1.5 h-3.5 w-2/3" />
          <div className="mt-4 flex gap-1.5">
            <ChipBar className="w-28" />
            <ChipBar className="w-20" />
            <ChipBar className="w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResultsSkeleton({
  layout,
  count,
}: {
  layout: Layout;
  count: number;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        layout === 'grid'
          ? 'grid grid-cols-1 gap-x-3 sm:grid-cols-2 xl:grid-cols-3'
          : 'flex flex-col',
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <ModCardSkeleton key={i} layout={layout} />
      ))}
    </div>
  );
}
