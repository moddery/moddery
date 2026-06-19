import { BadRequestException } from '@nestjs/common';

const defaultCredentialScopes = ['read:projects'] as const;
const allowedCredentialScopes = ['read:projects', 'write:projects'] as const;

export type CredentialScope = (typeof allowedCredentialScopes)[number];

export function normalizeCredentialScopes(
  scopes: readonly string[] | null | undefined,
): CredentialScope[] {
  const normalized = [...new Set(scopes ?? defaultCredentialScopes)]
    .map((scope) => scope.trim())
    .filter((scope) => scope.length > 0)
    .sort();

  if (normalized.length === 0) {
    return [...defaultCredentialScopes];
  }

  const credentialScopes: CredentialScope[] = [];
  for (const scope of normalized) {
    if (!isCredentialScope(scope)) {
      throw new BadRequestException(`Unsupported credential scope: ${scope}`);
    }

    credentialScopes.push(scope);
  }

  return credentialScopes;
}

function isCredentialScope(scope: string): scope is CredentialScope {
  return allowedCredentialScopes.includes(scope as CredentialScope);
}
