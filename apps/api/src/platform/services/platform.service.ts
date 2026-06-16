import { Injectable } from '@nestjs/common';
import {
  PROJECT_KINDS,
  SUPPORTED_GAME_VERSIONS,
  SUPPORTED_LOADERS,
} from '@moddery/shared';

@Injectable()
export class PlatformService {
  metadata() {
    return {
      gameVersions: [...SUPPORTED_GAME_VERSIONS],
      loaders: [...SUPPORTED_LOADERS],
      projectKinds: [...PROJECT_KINDS],
    };
  }
}
