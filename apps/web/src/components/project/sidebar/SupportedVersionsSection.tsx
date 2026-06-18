import { type SearchTag } from '../../ModCard.tsx';
import { VersionTag } from '../../Chips.tsx';

export function SupportedVersionsSection({
  onTagSearch,
  projectType,
  versions,
}: {
  onTagSearch?: (tag: SearchTag) => void;
  projectType: SearchTag['projectType'];
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
                : () =>
                    onTagSearch({
                      kind: 'version',
                      projectType,
                      value: version,
                    })
            }
          />
        ))}
      </div>
    </section>
  );
}
