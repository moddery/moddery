import { type ProjectKind } from '@moddery/shared';

import { type ProjectType } from '../types.ts';

export interface ProjectTypeMeta {
  type: ProjectType;
  label: string;
  singular: string;
  plural: string;
  path: string;
}

export const CONTENT_TYPES: ProjectTypeMeta[] = [
  { type: 'mod', label: 'Mods', singular: 'mod', plural: 'mods', path: 'mods' },
  {
    type: 'resourcepack',
    label: 'Resource Packs',
    singular: 'resource pack',
    plural: 'resource packs',
    path: 'resource-packs',
  },
  {
    type: 'datapack',
    label: 'Data Packs',
    singular: 'data pack',
    plural: 'data packs',
    path: 'data-packs',
  },
  {
    type: 'shader',
    label: 'Shaders',
    singular: 'shader',
    plural: 'shaders',
    path: 'shaders',
  },
  {
    type: 'modpack',
    label: 'Modpacks',
    singular: 'modpack',
    plural: 'modpacks',
    path: 'modpacks',
  },
  {
    type: 'plugin',
    label: 'Plugins',
    singular: 'plugin',
    plural: 'plugins',
    path: 'plugins',
  },
];

export const PROJECT_TYPE_META: Record<ProjectType, ProjectTypeMeta> =
  Object.fromEntries(CONTENT_TYPES.map((meta) => [meta.type, meta])) as Record<
    ProjectType,
    ProjectTypeMeta
  >;

export function projectTypeMeta(type: ProjectType): ProjectTypeMeta {
  return PROJECT_TYPE_META[type];
}

export function projectTypeFromKind(kind: ProjectKind): ProjectType {
  switch (kind) {
    case 'DATAPACK':
      return 'datapack';
    case 'MODPACK':
      return 'modpack';
    case 'PLUGIN':
      return 'plugin';
    case 'RESOURCE_PACK':
      return 'resourcepack';
    case 'SHADER':
      return 'shader';
    case 'MOD':
    default:
      return 'mod';
  }
}
