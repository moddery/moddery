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
    versions.flatMap((version) => version.gameVersions),
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
