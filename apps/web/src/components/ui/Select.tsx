import { Select } from '@base-ui-components/react/select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn.ts';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  ariaLabel: string;
  prefix?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  align?: 'start' | 'end';
  className?: string;
}

export function SelectField({
  ariaLabel,
  prefix,
  value,
  onValueChange,
  options,
  align = 'start',
  className,
}: SelectFieldProps) {
  return (
    <Select.Root
      items={options}
      value={value}
      onValueChange={(next) => onValueChange(next as string)}
    >
      <Select.Trigger
        aria-label={ariaLabel}
        className={cn(
          'inline-flex h-10 min-w-fit items-center gap-1.5 rounded-lg border border-line bg-control px-3 text-sm font-semibold text-ink',
          'transition-colors hover:border-line-strong hover:bg-control-hover data-[popup-open]:border-line-strong data-[popup-open]:bg-control-hover',
          align === 'end' && 'self-end',
          className,
        )}
      >
        {prefix && (
          <span className="shrink-0 font-medium text-muted">{prefix}</span>
        )}
        <Select.Value />
        <Select.Icon className="flex">
          <ChevronDown className="size-4 text-accent-icon" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner
          sideOffset={6}
          alignItemWithTrigger={false}
          className="z-50 outline-none"
        >
          <Select.Popup
            className={cn(
              'max-h-[min(20rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto',
              'rounded-lg border border-line bg-surface p-1 shadow-xl',
              'origin-[var(--transform-origin)] transition-[opacity,transform] duration-150',
              'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
              'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            )}
          >
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  'flex cursor-default items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-sm font-semibold text-muted outline-none',
                  'data-[highlighted]:bg-control-hover data-[highlighted]:text-ink',
                  'data-[selected]:text-ink',
                )}
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator className="flex">
                  <Check className="size-4 text-accent-icon" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
