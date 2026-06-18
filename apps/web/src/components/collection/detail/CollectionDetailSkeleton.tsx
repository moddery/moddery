export function CollectionDetailSkeleton() {
  return (
    <div className="mt-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="size-20 animate-pulse rounded-md bg-surface-2 sm:size-24" />
        <div className="min-w-0 flex-1">
          <div className="h-8 w-64 animate-pulse rounded bg-surface-2" />
          <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-2" />
          <div className="mt-4 h-4 w-full max-w-80 animate-pulse rounded bg-surface-2" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="h-28 animate-pulse rounded bg-surface-2" />
        <div className="h-28 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}
