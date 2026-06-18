export interface ScanStatusMeta {
  tone: 'clean' | 'failed' | 'pending' | 'warning';
  label: string;
}

export function scanStatusMeta({
  status,
  verdict,
}: {
  status: string;
  verdict: string | null;
}): ScanStatusMeta {
  const label = verdict ?? status;
  const normalized = label.toLowerCase();

  if (
    normalized.includes('clean') ||
    normalized.includes('safe') ||
    normalized.includes('passed')
  ) {
    return { label, tone: 'clean' };
  }

  if (
    normalized.includes('fail') ||
    normalized.includes('malware') ||
    normalized.includes('virus') ||
    normalized.includes('blocked') ||
    normalized.includes('rejected')
  ) {
    return { label, tone: 'failed' };
  }

  if (
    normalized.includes('pending') ||
    normalized.includes('queued') ||
    normalized.includes('running') ||
    normalized.includes('progress')
  ) {
    return { label, tone: 'pending' };
  }

  return { label, tone: 'warning' };
}
