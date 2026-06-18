import { type ProjectType } from '@moddery/shared';

export type Side = 'required' | 'optional' | 'unsupported';
export { type ProjectType };

export interface Mod {
  projectType?: ProjectType;
  slug: string;
  title: string;
  author: string;
  authorUsername?: string | null;
  organization?: {
    color: string | null;
    iconUrl: string | null;
    id: string;
    name: string;
    slug: string;
  } | null;
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
  color: string | null;
}

export type Environment = 'client' | 'server' | 'both';

export function environmentOf(mod: Mod): Environment {
  const clientCapable = mod.client !== 'unsupported';
  const serverCapable = mod.server !== 'unsupported';
  if (clientCapable && !serverCapable) return 'client';
  if (!clientCapable && serverCapable) return 'server';
  return 'both';
}
