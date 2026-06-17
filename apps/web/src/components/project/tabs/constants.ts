import { type ReportReason } from '@moddery/shared';

export type ProjectTab = 'description' | 'gallery' | 'changelog' | 'versions';

export const defaultProjectTab: ProjectTab = 'description';
export const projectTabs: { id: ProjectTab; label: string }[] = [
  { id: 'description', label: 'Description' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'changelog', label: 'Changelog' },
  { id: 'versions', label: 'Versions' },
];

export const reportReasons: { label: string; value: ReportReason }[] = [
  { label: 'Broken or misleading', value: 'BROKEN_OR_MISLEADING' },
  { label: 'Malware', value: 'MALWARE' },
  { label: 'Copyright', value: 'COPYRIGHT' },
  { label: 'Spam', value: 'SPAM' },
  { label: 'Impersonation', value: 'IMPERSONATION' },
  { label: 'Hateful or abusive', value: 'HATEFUL_OR_ABUSIVE' },
  { label: 'Other', value: 'OTHER' },
];
