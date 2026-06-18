import { enumLabel } from '../../lib/labels.ts';
import { type SelectOption } from '../ui/Select.tsx';

export const allTypesFilter = '__all_notification_types__';

export function buildTypeOptions(types: string[]): SelectOption[] {
  return [
    { label: 'All types', value: allTypesFilter },
    ...types.map((item) => ({ label: enumLabel(item), value: item })),
  ];
}
