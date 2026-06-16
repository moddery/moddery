import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NotificationSummary {
  @Field(() => String, { nullable: true })
  actionUrl!: string | null;

  @Field(() => String, { nullable: true })
  body!: string | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String)
  id!: string;

  @Field(() => Date, { nullable: true })
  readAt!: Date | null;

  @Field(() => String)
  state!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  type!: string;
}
