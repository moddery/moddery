import { Field, InputType } from '@nestjs/graphql';
import { type VersionChannel } from '@moddery/shared';

@InputType()
export class UpdateVersionInput {
  @Field(() => String, { nullable: true })
  changelog?: string | null;

  @Field(() => String, { nullable: true })
  channel?: VersionChannel | null;

  @Field(() => [String], { nullable: true })
  gameVersions?: string[] | null;

  @Field(() => [String], { nullable: true })
  loaders?: string[] | null;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String)
  versionId!: string;

  @Field(() => String, { nullable: true })
  versionNumber?: string | null;
}
