export function CollectionDetailSkeleton() {
  return (
    <div className="mt-5">
      <div className="h-8 w-64 animate-pulse rounded bg-surface-2" />
      <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-2" />
      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="h-28 animate-pulse rounded bg-surface-2" />
        <div className="h-28 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}
