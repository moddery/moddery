export const projectTeamPermissions = [
  'MANAGE_DETAILS',
  'MANAGE_MEMBERS',
  'MANAGE_SETTINGS',
  'MANAGE_VERSIONS',
  'VIEW_ANALYTICS',
] as const;

export const organizationTeamPermissions = [
  'MANAGE_DETAILS',
  'MANAGE_MEMBERS',
  'MANAGE_SETTINGS',
  'VIEW_ANALYTICS',
] as const;

export function permissionLabel(permission: string): string {
  return permission
    .trim()
    .toLowerCase()
    .split('_')
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
