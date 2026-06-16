import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SendNotificationInput {
  @Field(() => String, { nullable: true })
  actionUrl?: string | null;

  @Field(() => String, { nullable: true })
  body?: string | null;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  type!: string;

  @Field(() => String)
  username!: string;
}
