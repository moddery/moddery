import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TwoFactorSetup {
  @Field(() => String)
  otpAuthUrl!: string;

  @Field(() => String)
  secret!: string;
}
