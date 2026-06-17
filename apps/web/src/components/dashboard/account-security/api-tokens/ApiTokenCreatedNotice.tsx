export function ApiTokenCreatedNotice({ token }: { token: string }) {
  return (
    <div className="mt-4 rounded-lg border border-line bg-control p-3">
      <p className="text-sm font-bold text-ink">Copy this token now.</p>
      <code className="mt-2 block overflow-x-auto rounded-md bg-surface px-3 py-2 text-sm text-ink">
        {token}
      </code>
    </div>
  );
}
