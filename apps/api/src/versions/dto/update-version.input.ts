import { Field, InputType, Int } from '@nestjs/graphql';
import {
  PROJECT_STATUSES,
  VERSION_CHANNELS,
  type VersionChannel,
  type VersionStatus,
} from '@moddery/shared';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class UpdateVersionInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  changelog?: string | null;

  @Field(() => String, { nullable: true })
  @IsIn(VERSION_CHANNELS)
  @IsOptional()
  channel?: VersionChannel | null;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  gameVersions?: string[] | null;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  loaders?: string[] | null;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  featured?: boolean | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string | null;

  @Field(() => String, { nullable: true })
  @IsIn(PROJECT_STATUSES)
  @IsOptional()
  requestedStatus?: VersionStatus | null;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  sortOrder?: number | null;

  @Field(() => String, { nullable: true })
  @IsIn(PROJECT_STATUSES)
  @IsOptional()
  status?: VersionStatus | null;

  @Field(() => String)
  @IsString()
  versionId!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  versionNumber?: string | null;
}
