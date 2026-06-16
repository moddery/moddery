import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VersionFileSummary {
  @Field(() => String)
  fileName!: string;

  @Field(() => String)
  id!: string;

  @Field(() => Boolean)
  primary!: boolean;

  @Field(() => String)
  sizeBytes!: string;

  @Field(() => String)
  url!: string;
}

@ObjectType()
export class VersionSummary {
  @Field(() => String, { nullable: true })
  changelog!: string | null;

  @Field(() => String)
  channel!: string;

  @Field(() => Date, { nullable: true })
  datePublished!: Date | null;

  @Field(() => Int)
  downloads!: number;

  @Field(() => [VersionFileSummary])
  files!: VersionFileSummary[];

  @Field(() => [String])
  gameVersions!: string[];

  @Field(() => String)
  id!: string;

  @Field(() => [String])
  loaders!: string[];

  @Field(() => String)
  name!: string;

  @Field(() => String)
  projectSlug!: string;

  @Field(() => String)
  status!: string;

  @Field(() => String)
  versionNumber!: string;
}
