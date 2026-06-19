import { permissionLabel } from '../../lib/permissions.ts';

export function TeamPermissionsField({
  disabled,
  options,
  permissions,
  setPermissions,
}: {
  disabled?: boolean;
  options: readonly string[];
  permissions: string[];
  setPermissions: (value: string[]) => void;
}) {
  return (
    <fieldset className="grid gap-2 text-sm font-bold text-ink">
      <legend>Permissions</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((permission) => (
          <label
            key={permission}
            className="flex items-center gap-2 rounded-lg border border-line bg-control px-3 py-2 text-sm font-semibold text-muted transition-colors hover:border-line-strong hover:bg-control-hover"
          >
            <input
              disabled={disabled}
              type="checkbox"
              checked={permissions.includes(permission)}
              onChange={(event) => {
                setPermissions(
                  event.target.checked
                    ? [...permissions, permission]
                    : permissions.filter((value) => value !== permission),
                );
              }}
              className="size-4 accent-[var(--color-accent)] disabled:cursor-not-allowed"
            />
            {permissionLabel(permission)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
