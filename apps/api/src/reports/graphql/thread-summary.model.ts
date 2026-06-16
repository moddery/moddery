import { Field, ObjectType } from '@nestjs/graphql';

import { ReportUser } from './report-summary.model.js';

@ObjectType()
export class ThreadMessageSummary {
  @Field(() => ReportUser)
  author!: ReportUser;

  @Field(() => String)
  body!: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String)
  id!: string;
}

@ObjectType()
export class ThreadSummary {
  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String)
  id!: string;

  @Field(() => [ThreadMessageSummary])
  messages!: ThreadMessageSummary[];

  @Field(() => String, { nullable: true })
  reportId!: string | null;

  @Field(() => String)
  subject!: string;

  @Field(() => Date)
  updatedAt!: Date;
}
