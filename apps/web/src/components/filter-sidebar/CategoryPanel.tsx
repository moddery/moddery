import { categoryLabel } from '../Chips.tsx';
import { categoryIcon } from '../icons.tsx';
import { CheckRow } from './CheckRow.tsx';
import { Panel } from './Panel.tsx';
import { type FacetOption } from './types.ts';

export function CategoryPanel({
  options,
  selected,
  onToggle,
}: {
  options: FacetOption[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <Panel title="Category">
      <div>
        {options.map((o) => {
          const Icon = categoryIcon(o.value);
          return (
            <CheckRow
              key={o.value}
              checked={selected.has(o.value)}
              onToggle={() => onToggle(o.value)}
              label={categoryLabel(o.value)}
              icon={<Icon className="size-4 text-accent-icon" />}
            />
          );
        })}
      </div>
    </Panel>
  );
}
