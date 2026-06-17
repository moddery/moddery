import { type ProjectKind } from '@moddery/shared';

export const taxonomyProjectKinds: {
  label: string;
  value: ProjectKind | '';
}[] = [
  { label: 'Any project kind', value: '' },
  { label: 'Mod', value: 'MOD' },
  { label: 'Modpack', value: 'MODPACK' },
  { label: 'Resource pack', value: 'RESOURCE_PACK' },
  { label: 'Shader', value: 'SHADER' },
  { label: 'Plugin', value: 'PLUGIN' },
  { label: 'Datapack', value: 'DATAPACK' },
];
