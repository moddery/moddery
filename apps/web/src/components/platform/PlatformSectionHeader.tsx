export function PlatformSectionHeader({
  subtitle,
  title,
}: {
  subtitle: string;
  title: string;
}) {
  return (
    <div className="border-b border-line pb-3">
      <h2 className="font-display text-xl font-extrabold text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p>
    </div>
  );
}
