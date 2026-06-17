import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NotificationDeliverySummary {
  @Field(() => String)
  channel!: string;

  @Field(() => Int)
  attempts!: number;

  @Field(() => String)
  id!: string;

  @Field(() => String, { nullable: true })
  lastError!: string | null;

  @Field(() => Date)
  scheduledAt!: Date;

  @Field(() => Date, { nullable: true })
  sentAt!: Date | null;

  @Field(() => String)
  state!: string;
}

@ObjectType()
export class NotificationSummary {
  @Field(() => String, { nullable: true })
  actionUrl!: string | null;

  @Field(() => String, { nullable: true })
  body!: string | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => [NotificationDeliverySummary])
  deliveries!: NotificationDeliverySummary[];

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

@ObjectType()
export class NotificationSearchResult {
  @Field(() => [NotificationSummary])
  notifications!: NotificationSummary[];

  @Field(() => Int)
  totalHits!: number;
}
