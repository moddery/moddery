export function UsersDirectorySkeleton() {
  return (
    <div className="mt-6 grid gap-6">
      {[0, 1, 2].map((item) => (
        <section key={item} className="border-b border-line pb-6">
          <div className="flex gap-4">
            <div className="size-20 animate-pulse rounded-xl bg-surface-2" />
            <div className="flex-1">
              <div className="h-6 w-48 animate-pulse rounded bg-surface-2" />
              <div className="mt-3 h-4 w-72 animate-pulse rounded bg-surface-2" />
              <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-2" />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
