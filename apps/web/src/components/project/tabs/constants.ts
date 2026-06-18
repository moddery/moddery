import { REPORT_REASON_OPTIONS } from '@moddery/shared';

export type ProjectTab = 'description' | 'gallery' | 'changelog' | 'versions';

export const defaultProjectTab: ProjectTab = 'description';
export const projectTabs: { id: ProjectTab; label: string }[] = [
  { id: 'description', label: 'Description' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'changelog', label: 'Changelog' },
  { id: 'versions', label: 'Versions' },
];

export const reportReasons = REPORT_REASON_OPTIONS;
