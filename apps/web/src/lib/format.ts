export function formatCount(n: number, decimals = 1): string {
  if (n < 1000) return n.toLocaleString('en-US');
  const units = [
    { v: 1e9, s: 'B' },
    { v: 1e6, s: 'M' },
    { v: 1e3, s: 'K' },
  ];
  for (const u of units) {
    if (n >= u.v) {
      const trimmed = (n / u.v).toFixed(decimals).replace(/\.?0+$/, '');
      return trimmed + u.s;
    }
  }
  return String(n);
}

export function timeAgo(iso: string, now: Date = new Date()): string {
  const diff = Math.max(0, now.getTime() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const mon = Math.floor(day / 30);
  const yr = Math.floor(day / 365);

  if (yr >= 1) return plural(yr, 'year');
  if (mon >= 1) return plural(mon, 'month');
  if (day >= 1) return plural(day, 'day');
  if (hr >= 1) return plural(hr, 'hour');
  if (min >= 1) return plural(min, 'minute');
  return 'just now';
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 'KB';

  for (let i = 1; i < units.length && value >= 1024; i++) {
    value /= 1024;
    unit = units[i] ?? unit;
  }

  return `${value.toFixed(value >= 10 ? 1 : 2).replace(/\.0$/, '')} ${unit}`;
}

function plural(n: number, unit: string): string {
  return `${String(n)} ${unit}${n === 1 ? '' : 's'} ago`;
}

export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}
