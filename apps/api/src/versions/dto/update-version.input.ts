import { Field, InputType, Int } from '@nestjs/graphql';
import { type VersionChannel, type VersionStatus } from '@moddery/shared';

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

  @Field(() => Boolean, { nullable: true })
  featured?: boolean | null;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  requestedStatus?: VersionStatus | null;

  @Field(() => Int, { nullable: true })
  sortOrder?: number | null;

  @Field(() => String, { nullable: true })
  status?: VersionStatus | null;

  @Field(() => String)
  versionId!: string;

  @Field(() => String, { nullable: true })
  versionNumber?: string | null;
}
