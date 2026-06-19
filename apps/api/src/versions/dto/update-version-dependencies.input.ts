import { Field, InputType } from '@nestjs/graphql';
import { DEPENDENCY_KINDS, type DependencyKind } from '@moddery/shared';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

@InputType()
export class VersionDependencyInput {
  @Field(() => String)
  @IsIn(DEPENDENCY_KINDS)
  dependencyKind!: DependencyKind;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  externalFileName?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  targetProjectSlug?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  targetVersionId?: string | null;
}

@InputType()
export class UpdateVersionDependenciesInput {
  @Field(() => [VersionDependencyInput])
  @IsArray()
  @Type(() => VersionDependencyInput)
  @ValidateNested({ each: true })
  dependencies!: VersionDependencyInput[];

  @Field(() => String)
  @IsString()
  versionId!: string;
}
