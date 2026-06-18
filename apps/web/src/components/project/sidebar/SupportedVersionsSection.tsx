import { type SearchTag } from '../../ModCard.tsx';
import { VersionTag } from '../../Chips.tsx';

export function SupportedVersionsSection({
  onTagSearch,
  versions,
}: {
  onTagSearch?: (tag: SearchTag) => void;
  versions: string[];
}) {
  if (versions.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-extrabold text-ink">
        Supported Versions
      </h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {versions.map((version) => (
          <VersionTag
            key={version}
            version={version}
            onClick={
              onTagSearch === undefined
                ? undefined
                : () => onTagSearch({ kind: 'version', value: version })
            }
          />
        ))}
      </div>
    </section>
  );
}
