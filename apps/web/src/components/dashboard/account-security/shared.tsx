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

export type CredentialScope = 'read:projects' | 'write:projects';

export const credentialScopeOptions: readonly {
  label: string;
  value: CredentialScope;
}[] = [
  { label: 'Read projects', value: 'read:projects' },
  { label: 'Write projects', value: 'write:projects' },
];

export function CredentialScopesField({
  disabled,
  scopes,
  onChange,
}: {
  disabled?: boolean;
  scopes: readonly CredentialScope[];
  onChange: (scopes: CredentialScope[]) => void;
}) {
  return (
    <fieldset className="grid gap-2 text-sm font-bold text-ink">
      <legend>Scopes</legend>
      <div className="flex flex-wrap gap-2">
        {credentialScopeOptions.map((option) => (
          <label
            key={option.value}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-control px-3 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
          >
            <input
              type="checkbox"
              disabled={disabled}
              checked={scopes.includes(option.value)}
              onChange={() =>
                onChange(toggleCredentialScope(scopes, option.value))
              }
              className="size-4 accent-accent disabled:cursor-not-allowed"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function toggleCredentialScope(
  scopes: readonly CredentialScope[],
  scope: CredentialScope,
): CredentialScope[] {
  if (scopes.includes(scope)) {
    return scopes.filter((candidate) => candidate !== scope);
  }

  return [...scopes, scope].sort();
}

export function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
