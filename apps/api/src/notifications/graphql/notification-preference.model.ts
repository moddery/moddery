import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NotificationPreferenceSummary {
  @Field(() => String)
  channel!: string;

  @Field(() => Boolean)
  enabled!: boolean;

  @Field(() => String)
  type!: string;

  @Field(() => Date)
  updatedAt!: Date;
}
