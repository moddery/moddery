import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateProjectLinkInput {
  @Field(() => String)
  kind!: string;

  @Field(() => String, { nullable: true })
  label?: string | null;

  @Field(() => String)
  url!: string;
}

@InputType()
export class UpdateProjectInput {
  @Field(() => [String], { nullable: true })
  categories?: string[] | null;

  @Field(() => String, { nullable: true })
  color?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  discordUrl?: string | null;

  @Field(() => [String], { nullable: true })
  gameVersions?: string[] | null;

  @Field(() => String, { nullable: true })
  iconUrl?: string | null;

  @Field(() => String, { nullable: true })
  issuesUrl?: string | null;

  @Field(() => String, { nullable: true })
  licenseKey?: string | null;

  @Field(() => String, { nullable: true })
  licenseName?: string | null;

  @Field(() => String, { nullable: true })
  licenseUrl?: string | null;

  @Field(() => [UpdateProjectLinkInput], { nullable: true })
  links?: UpdateProjectLinkInput[] | null;

  @Field(() => [String], { nullable: true })
  loaders?: string[] | null;

  @Field(() => String)
  projectSlug!: string;

  @Field(() => String, { nullable: true })
  sourceUrl?: string | null;

  @Field(() => String, { nullable: true })
  summary?: string | null;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => String, { nullable: true })
  wikiUrl?: string | null;
}
