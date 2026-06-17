import { type ReportReason } from '@moddery/shared';

export const reportReasons: { label: string; value: ReportReason }[] = [
  { label: 'Broken or misleading', value: 'BROKEN_OR_MISLEADING' },
  { label: 'Malware', value: 'MALWARE' },
  { label: 'Copyright', value: 'COPYRIGHT' },
  { label: 'Spam', value: 'SPAM' },
  { label: 'Impersonation', value: 'IMPERSONATION' },
  { label: 'Hateful or abusive', value: 'HATEFUL_OR_ABUSIVE' },
  { label: 'Other', value: 'OTHER' },
];
