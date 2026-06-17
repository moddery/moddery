export function CollectionDirectorySkeleton() {
  return (
    <div className="mt-6 grid gap-8">
      {[0, 1, 2].map((item) => (
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
