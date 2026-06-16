import { Field, InputType, Int } from '@nestjs/graphql';
import { type VersionChannel } from '@moddery/shared';

@InputType()
export class CreateVersionFileInput {
  @Field(() => String)
  fileName!: string;

  @Field(() => Boolean, { defaultValue: true })
  primary!: boolean;

  @Field(() => Int)
  sizeBytes!: number;

  @Field(() => String)
  url!: string;
}

@InputType()
export class CreateVersionInput {
  @Field(() => String, { nullable: true })
  changelog?: string | null;

  @Field(() => String)
  channel!: VersionChannel;

  @Field(() => [CreateVersionFileInput])
  files!: CreateVersionFileInput[];

  @Field(() => [String], { nullable: true })
  gameVersions?: string[];

  @Field(() => [String], { nullable: true })
  loaders?: string[];

  @Field(() => String)
  name!: string;

  @Field(() => String)
  projectSlug!: string;

  @Field(() => String)
  versionNumber!: string;
}
