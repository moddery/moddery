import { type ProjectType } from '../../types.ts';
import { type SearchTag } from '../ModCard.tsx';

export interface HomeBrowseShortcut {
  description: string;
  label: string;
  tag: SearchTag;
}

export interface HomeBrowseGroup {
  label: string;
  projectType: ProjectType;
  shortcuts: HomeBrowseShortcut[];
}

export const HOME_BROWSE_GROUPS: HomeBrowseGroup[] = [
  {
    label: 'Client mods',
    projectType: 'mod',
    shortcuts: [
      shortcut('Optimization', 'Performance-focused client and server mods.', {
        kind: 'category',
        projectType: 'mod',
        value: 'optimization',
      }),
      shortcut(
        'Adventure',
        'Worldgen, exploration, and progression projects.',
        {
          kind: 'category',
          projectType: 'mod',
          value: 'adventure',
        },
      ),
      shortcut('Fabric', 'Projects built for the Fabric loader.', {
        kind: 'loader',
        projectType: 'mod',
        value: 'fabric',
      }),
    ],
  },
  {
    label: 'Servers',
    projectType: 'plugin',
    shortcuts: [
      shortcut('Management', 'Tools for server operations and moderation.', {
        kind: 'category',
        projectType: 'plugin',
        value: 'management',
      }),
      shortcut('Paper', 'Plugins built for Paper-compatible servers.', {
        kind: 'loader',
        projectType: 'plugin',
        value: 'paper',
      }),
      shortcut('Utility', 'Small server tools and workflow helpers.', {
        kind: 'category',
        projectType: 'plugin',
        value: 'utility',
      }),
    ],
  },
  {
    label: 'Packs',
    projectType: 'modpack',
    shortcuts: [
      shortcut('Quests', 'Progression-heavy packs and guided play.', {
        kind: 'category',
        projectType: 'modpack',
        value: 'adventure',
      }),
      shortcut('Utility', 'Packs focused on practical workflow improvements.', {
        kind: 'category',
        projectType: 'modpack',
        value: 'utility',
      }),
      shortcut('1.21.6', 'Projects targeting the latest seeded game line.', {
        kind: 'version',
        projectType: 'modpack',
        value: '1.21.6',
      }),
    ],
  },
];

function shortcut(
  label: string,
  description: string,
  tag: SearchTag,
): HomeBrowseShortcut {
  return {
    description,
    label,
    tag,
  };
}
