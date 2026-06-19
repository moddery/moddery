export function DashboardField({
  disabled,
  list,
  label,
  onChange,
  placeholder,
  required,
  value,
}: {
  disabled?: boolean;
  list?: string;
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
        list={list}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-line bg-control px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

export function DashboardTextarea({
  disabled,
  label,
  onChange,
  placeholder,
  required,
  rows,
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold text-ink">
      {label}
      <textarea
        disabled={disabled}
        required={required}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

export function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}
