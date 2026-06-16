export type Side = 'required' | 'optional' | 'unsupported';
export type ProjectType =
  | 'mod'
  | 'resourcepack'
  | 'datapack'
  | 'shader'
  | 'modpack'
  | 'plugin';

export interface Mod {
  projectType?: ProjectType;
  slug: string;
  title: string;
  author: string;
  description: string;
  icon: string | null;
  downloads: number;
  follows: number;
  updated: string;
  loaders: string[];
  categories: string[];
  gameVersions: string[];
  client: Side;
  server: Side;
  color: string;
}

export type Environment = 'client' | 'server' | 'both';

export function environmentOf(mod: Mod): Environment {
  const clientCapable = mod.client !== 'unsupported';
  const serverCapable = mod.server !== 'unsupported';
  if (clientCapable && !serverCapable) return 'client';
  if (!clientCapable && serverCapable) return 'server';
  return 'both';
}
