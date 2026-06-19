import { type CreateVersionInput } from '../../../lib/dashboard.ts';

export function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function versionFileHashes({
  sha1,
  sha256,
}: {
  sha1: string;
  sha256: string;
}): CreateVersionInput['files'][number]['hashes'] {
  return [
    { algorithm: 'SHA1', value: sha1.trim() },
    { algorithm: 'SHA256', value: sha256.trim() },
  ].filter((hash) => hash.value.length > 0);
}

export function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function DashboardField({
  disabled,
  label,
  onChange,
  placeholder,
  required,
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold text-ink">
      {label}
      <input
        disabled={disabled}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}
