import {
  type DashboardProject,
  type UpdateProjectInput,
} from '../../../lib/dashboard.ts';
import { nullableText } from './shared.tsx';

const directProjectLinkKinds = new Set(['SOURCE', 'ISSUES', 'WIKI', 'DISCORD']);

export function projectLinksText(
  project: DashboardProject | undefined,
): string {
  return (
    project?.links
      .filter((link) => !directProjectLinkKinds.has(link.kind))
      .map((link) => [link.kind, link.label ?? '', link.url].join(' | '))
      .join('\n') ?? ''
  );
}

export function parseProjectLinks(value: string): UpdateProjectInput['links'] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [kind = '', label = '', url = ''] = line
        .split('|')
        .map((part) => part.trim());
      return {
        kind,
        label: nullableText(label),
        url,
      };
    });
}
