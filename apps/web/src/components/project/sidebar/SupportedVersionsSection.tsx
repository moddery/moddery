import { Chip } from '../../Chips.tsx';

export function SupportedVersionsSection({ versions }: { versions: string[] }) {
  if (versions.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-extrabold text-ink">
        Supported Versions
      </h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {versions.map((version) => (
          <Chip key={version}>{version}</Chip>
        ))}
      </div>
    </section>
  );
}
