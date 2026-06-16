import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type AuthenticatedUser } from '../services/auth-token.service.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext<{
      req: { user: AuthenticatedUser };
    }>().req;

    return request.user;
  },
);
