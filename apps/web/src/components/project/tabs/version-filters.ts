import { type ProjectVersion } from '../../../lib/catalog.ts';
import { compareVersions } from '../../../lib/format.ts';
import { type SelectOption } from '../../ui/Select.tsx';

export const allVersionFilter = '__all_versions__';
export const allLoaderFilter = '__all_loaders__';

const preferredLoaderOrder = [
  'fabric',
  'neoforge',
  'forge',
  'quilt',
  'babric',
  'paper',
  'spigot',
  'bukkit',
  'iris',
  'optifine',
];

export function buildGameVersionOptions(
  versions: ProjectVersion[],
): SelectOption[] {
  const gameVersions = new Set(
    versions.flatMap((version) => version.game_versions),
  );

  return [
    { label: 'All versions', value: allVersionFilter },
    ...[...gameVersions]
      .sort((a, b) => compareVersions(b, a))
      .map((version) => ({ label: version, value: version })),
  ];
}

export function buildLoaderOptions(versions: ProjectVersion[]): SelectOption[] {
  const loaders = new Set(versions.flatMap((version) => version.loaders));

  return [
    { label: 'All loaders', value: allLoaderFilter },
    ...[...loaders]
      .sort((a, b) => {
        const aIndex = preferredLoaderOrder.indexOf(a);
        const bIndex = preferredLoaderOrder.indexOf(b);

        if (aIndex !== -1 || bIndex !== -1) {
          return (
            (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
          );
        }

        return a.localeCompare(b);
      })
      .map((loader) => ({ label: formatLoaderLabel(loader), value: loader })),
  ];
}

export function filterProjectVersions(
  versions: ProjectVersion[],
  gameVersion: string,
  loader: string,
  query = '',
): ProjectVersion[] {
  const normalizedQuery = query.trim().toLowerCase();

  return versions
    .filter((version) => {
      const matchesGameVersion =
        gameVersion === allVersionFilter ||
        version.game_versions.includes(gameVersion);
      const matchesLoader =
        loader === allLoaderFilter || version.loaders.includes(loader);
      const matchesQuery =
        normalizedQuery === '' ||
        versionSearchText(version).includes(normalizedQuery);

      return matchesGameVersion && matchesLoader && matchesQuery;
    })
    .sort(
      (a, b) => Date.parse(b.date_published) - Date.parse(a.date_published),
    );
}

function formatLoaderLabel(loader: string): string {
  const labels: Record<string, string> = {
    babric: 'Babric',
    bukkit: 'Bukkit',
    fabric: 'Fabric',
    forge: 'Forge',
    iris: 'Iris',
    neoforge: 'NeoForge',
    optifine: 'OptiFine',
    paper: 'Paper',
    quilt: 'Quilt',
    spigot: 'Spigot',
  };

  return labels[loader] ?? loader;
}

function versionSearchText(version: ProjectVersion): string {
  const dependencyText = version.dependencies
    .map(
      (dependency) =>
        `${dependency.dependencyKind} ${
          dependency.targetProject?.title ?? ''
        } ${dependency.targetProject?.slug ?? ''} ${
          dependency.targetVersion?.versionNumber ?? ''
        } ${dependency.externalFileName ?? ''}`,
    )
    .join(' ');
  const fileText = version.files
    .map(
      (file) =>
        `${file.filename} ${file.kind} ${file.hashes
          .map((hash) => `${hash.algorithm} ${hash.value}`)
          .join(' ')}`,
    )
    .join(' ');

  return [
    version.name,
    version.version_number,
    version.version_type,
    version.status,
    version.requested_status ?? '',
    version.author?.username ?? '',
    version.author?.display_name ?? '',
    version.loaders.join(' '),
    version.game_versions.join(' '),
    dependencyText,
    fileText,
  ]
    .join(' ')
    .toLowerCase();
}
