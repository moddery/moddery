import { SetMetadata } from '@nestjs/common';

import { type CredentialScope } from '../services/credential-scopes.js';

export const CREDENTIAL_SCOPES_KEY = 'credentialScopes';

export const RequireCredentialScopes = (
  ...scopes: CredentialScope[]
): MethodDecorator & ClassDecorator =>
  SetMetadata(CREDENTIAL_SCOPES_KEY, scopes);
