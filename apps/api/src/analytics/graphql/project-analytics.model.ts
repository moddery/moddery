import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProjectAnalyticsDay {
  @Field(() => String)
  date!: string;

  @Field(() => Int)
  downloads!: number;

  @Field(() => Int)
  views!: number;
}

@ObjectType()
export class ProjectAnalyticsSummary {
  @Field(() => [ProjectAnalyticsDay])
  days!: ProjectAnalyticsDay[];

  @Field(() => Int)
  downloadsLast30Days!: number;

  @Field(() => String)
  projectSlug!: string;

  @Field(() => Int)
  totalDownloads!: number;

  @Field(() => Int)
  totalViews!: number;

  @Field(() => Int)
  viewsLast30Days!: number;
}
