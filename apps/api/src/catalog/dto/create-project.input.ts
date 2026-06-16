import { Field, InputType } from '@nestjs/graphql';
import { type ProjectKind } from '@moddery/shared';

@InputType()
export class CreateProjectInput {
  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field(() => String)
  description!: string;

  @Field(() => [String], { nullable: true })
  gameVersions?: string[];

  @Field(() => String)
  kind!: ProjectKind;

  @Field(() => [String], { nullable: true })
  loaders?: string[];

  @Field(() => String)
  slug!: string;

  @Field(() => String)
  summary!: string;

  @Field(() => String)
  title!: string;
}
