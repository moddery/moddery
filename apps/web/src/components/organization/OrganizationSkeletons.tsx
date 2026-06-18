export function OrganizationSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <div className="border-b border-line pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="size-20 animate-pulse rounded-md bg-surface-2 sm:size-24" />
          <div className="min-w-0 flex-1">
            <div className="h-8 w-56 animate-pulse rounded bg-surface-2" />
            <div className="mt-3 h-4 w-64 animate-pulse rounded bg-surface-2" />
            <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-2" />
          </div>
          <div className="h-9 w-28 animate-pulse rounded-lg bg-surface-2" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="h-20 animate-pulse rounded-lg bg-surface-2" />
          <div className="h-20 animate-pulse rounded-lg bg-surface-2" />
          <div className="h-20 animate-pulse rounded-lg bg-surface-2" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="h-28 animate-pulse rounded bg-surface-2" />
        <div className="h-28 animate-pulse rounded bg-surface-2" />
      </div>
    </main>
  );
}

export function OrganizationDirectorySkeleton() {
  return (
    <div className="mt-6 grid gap-8">
      {[0, 1].map((item) => (
        <section key={item} className="border-b border-line pb-7">
          <div className="h-6 w-48 animate-pulse rounded bg-surface-2" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-surface-2" />
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="h-28 animate-pulse rounded bg-surface-2" />
            <div className="h-28 animate-pulse rounded bg-surface-2" />
          </div>
        </section>
      ))}
    </div>
  );
}
