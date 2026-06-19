import { isGameVersionTag } from '@moddery/shared';
import { Loader, type Prisma } from '@prisma/client';

export async function replaceVersionGameVersions(
  tx: Prisma.TransactionClient,
  versionId: string,
  versions: readonly string[],
): Promise<void> {
  await tx.versionGameVersion.deleteMany({ where: { versionId } });

  for (const version of uniqueNormalized(versions).filter(isGameVersionTag)) {
    const gameVersion = await tx.gameVersion.upsert({
      create: { version },
      update: {},
      where: { version },
    });
    await tx.versionGameVersion.create({
      data: { gameVersionId: gameVersion.id, versionId },
    });
  }
}

export async function replaceVersionLoaders(
  tx: Prisma.TransactionClient,
  versionId: string,
  loaders: readonly string[],
): Promise<void> {
  await tx.versionLoader.deleteMany({ where: { versionId } });

  for (const loader of uniqueNormalized(loaders).flatMap((value) => {
    const mapped = loaderToEnum(value);
    return mapped === null ? [] : [mapped];
  })) {
    await tx.versionLoader.create({ data: { loader, versionId } });
  }
}

function loaderToEnum(loader: string): Loader | null {
  if (loader === 'fabric') return Loader.FABRIC;
  if (loader === 'forge') return Loader.FORGE;
  if (loader === 'neoforge') return Loader.NEOFORGE;
  if (loader === 'quilt') return Loader.QUILT;
  return null;
}

function uniqueNormalized(values: readonly string[]): string[] {
  return [
    ...new Set(
      values
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length > 0),
    ),
  ];
}
