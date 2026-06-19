import { loaderLabel, LoaderTag, VersionTag } from '../Chips.tsx';
import { buildPlatformDiscoverHref } from './platformDiscoverHref.ts';
import { PlatformSectionHeader } from './PlatformSectionHeader.tsx';

export function PlatformCompatibilitySection({
  gameVersions,
  loaders,
}: {
  gameVersions: string[];
  loaders: string[];
}) {
  return (
    <section>
      <PlatformSectionHeader
        title="Compatibility"
        subtitle="Supported loaders and game versions available in project filters."
      />
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-base font-extrabold text-ink">
            Loaders
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {loaders.map((loader) => (
              <a
                key={loader}
                href={buildPlatformDiscoverHref({ loader })}
                className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                aria-label={`Search ${loaderLabel(loader)} projects`}
              >
                <LoaderTag loader={loader} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-display text-base font-extrabold text-ink">
            Game Versions
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {gameVersions.map((version) => (
              <a
                key={version}
                href={buildPlatformDiscoverHref({ version })}
                className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                aria-label={`Search projects for game version ${version}`}
              >
                <VersionTag version={version} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
