import { Injectable } from '@nestjs/common';

interface VersionSummarySeed {
  readonly gameVersion: string;
  readonly id: string;
  readonly loaders: string[];
  readonly name: string;
  readonly projectSlug: string;
  readonly versionNumber: string;
}

const versionsSeed = [
  {
    gameVersion: '1.21.6',
    id: 'version_sodium_plus_1_0_0',
    loaders: ['fabric', 'quilt'],
    name: 'Sodium Plus 1.0.0',
    projectSlug: 'sodium-plus',
    versionNumber: '1.0.0',
  },
] satisfies readonly VersionSummarySeed[];

@Injectable()
export class VersionsService {
  findByProjectSlug(projectSlug: string): VersionSummarySeed[] {
    return versionsSeed.filter(
      (version) => version.projectSlug === projectSlug,
    );
  }
}
