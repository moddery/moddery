export function PageLoading() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded bg-surface-2" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-surface-2" />
      <div className="mt-2 h-4 w-full max-w-md animate-pulse rounded bg-surface-2" />
    </main>
  );
}
