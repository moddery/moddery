import { type SelectOption } from '../ui/Select.tsx';

export const allTypesFilter = '__all_notification_types__';

export function buildTypeOptions(types: string[]): SelectOption[] {
  return [
    { label: 'All types', value: allTypesFilter },
    ...types.map((item) => ({ label: formatTypeLabel(item), value: item })),
  ];
}

function formatTypeLabel(type: string) {
  return type
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}
