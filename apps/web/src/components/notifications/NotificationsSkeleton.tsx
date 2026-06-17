export function NotificationsSkeleton() {
  return (
    <div className="mt-4 grid gap-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="border-b border-line py-4">
          <div className="h-5 w-48 animate-pulse rounded bg-surface-2" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-surface-2" />
          <div className="mt-2 h-3 w-28 animate-pulse rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}
