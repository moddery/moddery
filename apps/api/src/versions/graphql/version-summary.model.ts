import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VersionSummary {
  @Field(() => String)
  gameVersion!: string;

  @Field(() => String)
  id!: string;

  @Field(() => [String])
  loaders!: string[];

  @Field(() => String)
  name!: string;

  @Field(() => String)
  projectSlug!: string;

  @Field(() => String)
  versionNumber!: string;
}
