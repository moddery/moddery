import { Field, Int, ObjectType } from '@nestjs/graphql';

import { AuthUser } from './auth-user.model.js';

@ObjectType()
export class AuthPayload {
  @Field(() => String)
  accessToken!: string;

  @Field(() => Int)
  expiresIn!: number;

  @Field(() => String)
  tokenType!: 'Bearer';

  @Field(() => AuthUser)
  user!: AuthUser;
}
