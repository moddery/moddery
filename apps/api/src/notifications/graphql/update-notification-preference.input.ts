import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateNotificationPreferenceInput {
  @Field(() => String)
  channel!: string;

  @Field(() => Boolean)
  enabled!: boolean;

  @Field(() => String)
  type!: string;
}
