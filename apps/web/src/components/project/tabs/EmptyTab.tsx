export function EmptyTab({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-8">
      <h2 className="font-display text-lg font-extrabold text-ink">{title}</h2>
      <p className="mt-1 max-w-xl text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}
