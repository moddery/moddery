export function ClientSecretNotice({
  clientSecret,
}: {
  clientSecret: string | null;
}) {
  if (!clientSecret) {
    return null;
  }

  return (
    <div className="mt-4 rounded-lg border border-line bg-surface p-4">
      <p className="text-sm font-bold text-ink">Client secret</p>
      <code className="mt-2 block overflow-x-auto rounded-md bg-control px-3 py-2 text-sm text-ink">
        {clientSecret}
      </code>
      <p className="mt-2 text-xs font-semibold text-muted">
        Store this now. It is shown once.
      </p>
    </div>
  );
}
