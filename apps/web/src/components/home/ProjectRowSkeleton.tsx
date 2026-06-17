export function ProjectRowSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded bg-surface-2" />
      ))}
    </div>
  );
}
