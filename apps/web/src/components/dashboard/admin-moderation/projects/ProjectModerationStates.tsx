export function ProjectModerationSkeleton() {
  return (
    <div className="mt-4 grid gap-3">
      <div className="h-24 animate-pulse rounded bg-surface-2" />
      <div className="h-24 animate-pulse rounded bg-surface-2" />
    </div>
  );
}

export function ProjectModerationError({ message }: { message: string }) {
  return (
    <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
      {message}
    </p>
  );
}

export function ProjectModerationEmpty() {
  return (
    <p className="py-8 text-sm text-muted">
      No projects are waiting on moderation.
    </p>
  );
}
