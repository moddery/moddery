import { Field, ObjectType } from '@nestjs/graphql';

import { ReportUser } from '../../reports/graphql/report-summary.model.js';

@ObjectType()
export class ModerationActionSummary {
  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String)
  id!: string;

  @Field(() => String)
  kind!: string;

  @Field(() => ReportUser)
  moderator!: ReportUser;

  @Field(() => String)
  projectId!: string;

  @Field(() => String, { nullable: true })
  reason!: string | null;
}
