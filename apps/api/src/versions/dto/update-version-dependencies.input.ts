import { Field, InputType } from '@nestjs/graphql';
import { type DependencyKind } from '@moddery/shared';

@InputType()
export class VersionDependencyInput {
  @Field(() => String)
  dependencyKind!: DependencyKind;

  @Field(() => String, { nullable: true })
  externalFileName?: string | null;

  @Field(() => String, { nullable: true })
  targetProjectSlug?: string | null;

  @Field(() => String, { nullable: true })
  targetVersionId?: string | null;
}

@InputType()
export class UpdateVersionDependenciesInput {
  @Field(() => [VersionDependencyInput])
  dependencies!: VersionDependencyInput[];

  @Field(() => String)
  versionId!: string;
}
