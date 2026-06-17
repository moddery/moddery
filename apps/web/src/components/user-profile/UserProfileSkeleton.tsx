export function UserProfileSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <div className="border-b border-line pb-6">
        <div className="flex gap-5">
          <div className="size-20 animate-pulse rounded-xl bg-surface-2" />
          <div className="flex-1">
            <div className="h-8 w-56 animate-pulse rounded bg-surface-2" />
            <div className="mt-3 h-4 w-40 animate-pulse rounded bg-surface-2" />
            <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="h-28 animate-pulse rounded bg-surface-2" />
        <div className="h-28 animate-pulse rounded bg-surface-2" />
      </div>
    </main>
  );
}
