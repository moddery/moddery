export function organizationMemberPosition(sortOrder: number): string {
  return `Position ${(sortOrder + 1).toLocaleString('en-US')}`;
}
