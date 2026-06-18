export function TaxonomyCheckboxGroup({
  label,
  onChange,
  options,
  selected,
}: {
  label: string;
  onChange: (value: string[]) => void;
  options: { label: string; value: string }[];
  selected: string[];
}) {
  return (
    <fieldset className="grid gap-2 text-sm font-bold text-ink">
      <legend>{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 rounded-lg border border-line bg-control px-3 py-2 text-sm font-semibold text-muted transition-colors hover:border-line-strong hover:bg-control-hover"
          >
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={(event) => {
                onChange(
                  event.target.checked
                    ? [...selected, option.value]
                    : selected.filter((value) => value !== option.value),
                );
              }}
              className="size-4 accent-[var(--color-accent)]"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
