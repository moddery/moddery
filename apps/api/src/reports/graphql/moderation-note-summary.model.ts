import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ReportUser } from './report-summary.model.js';

@ObjectType()
export class ModerationNoteSummary {
  @Field(() => ReportUser)
  author!: ReportUser;

  @Field(() => String)
  body!: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String)
  id!: string;

  @Field(() => String, { nullable: true })
  projectId!: string | null;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => String, { nullable: true })
  userId!: string | null;
}

@ObjectType()
export class ModerationNoteSearchResult {
  @Field(() => [ModerationNoteSummary])
  notes!: ModerationNoteSummary[];

  @Field(() => Int)
  totalHits!: number;
}
