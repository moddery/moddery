import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ReportProjectTarget {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => String)
  title!: string;
}

@ObjectType()
export class ReportUser {
  @Field(() => String, { nullable: true })
  displayName!: string | null;

  @Field(() => String)
  id!: string;

  @Field(() => String)
  username!: string;
}

@ObjectType()
export class ReportSummary {
  @Field(() => String)
  body!: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String)
  id!: string;

  @Field(() => String, { nullable: true })
  projectId!: string | null;

  @Field(() => ReportProjectTarget, { nullable: true })
  project?: ReportProjectTarget | null;

  @Field(() => String)
  reason!: string;

  @Field(() => ReportUser, { nullable: true })
  reporter?: ReportUser | null;

  @Field(() => String)
  state!: string;

  @Field(() => ReportUser, { nullable: true })
  userTarget?: ReportUser | null;

  @Field(() => String, { nullable: true })
  userTargetId!: string | null;

  @Field(() => String, { nullable: true })
  versionId!: string | null;
}
