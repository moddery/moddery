import { Field, Int, ObjectType } from '@nestjs/graphql';
import { type ProjectKind, type ProjectStatus } from '@moddery/shared';

@ObjectType()
export class ProjectSummary {
  @Field(() => Int)
  downloads!: number;

  @Field(() => String)
  id!: string;

  @Field(() => String)
  kind!: ProjectKind;

  @Field(() => String)
  slug!: string;

  @Field(() => String)
  status!: ProjectStatus;

  @Field(() => String)
  summary!: string;

  @Field(() => String)
  title!: string;

  @Field(() => Date)
  updatedAt!: Date;
}
