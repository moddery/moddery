import { loaderLabel } from '../Chips.tsx';
import { LoaderGlyph } from '../icons.tsx';
import { CheckRow } from './CheckRow.tsx';
import { Panel } from './Panel.tsx';
import { type FacetOption } from './types.ts';

export function LoaderPanel({
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
    <Panel title="Loader">
      <div>
        {options.map((o) => (
          <CheckRow
            key={o.value}
            checked={selected.has(o.value)}
            onToggle={() => onToggle(o.value)}
            label={loaderLabel(o.value)}
            icon={<LoaderGlyph className="size-4 text-accent-icon" />}
          />
        ))}
      </div>
    </Panel>
  );
}
