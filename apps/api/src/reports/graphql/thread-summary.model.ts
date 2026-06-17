import { Field, Int, ObjectType } from '@nestjs/graphql';

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
export class ThreadMemberSummary {
  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date, { nullable: true })
  lastReadAt!: Date | null;

  @Field(() => ReportUser)
  user!: ReportUser;
}

@ObjectType()
export class ThreadSummary {
  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String)
  id!: string;

  @Field(() => [ThreadMessageSummary])
  messages!: ThreadMessageSummary[];

  @Field(() => [ThreadMemberSummary])
  members!: ThreadMemberSummary[];

  @Field(() => String, { nullable: true })
  reportId!: string | null;

  @Field(() => String)
  subject!: string;

  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType()
export class ThreadSearchResult {
  @Field(() => [ThreadSummary])
  threads!: ThreadSummary[];

  @Field(() => Int)
  totalHits!: number;
}
