import { Field, InputType, Int } from '@nestjs/graphql';
import { VERSION_CHANNELS, type VersionChannel } from '@moddery/shared';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

@InputType()
export class CreateVersionFileHashInput {
  @Field(() => String)
  @IsString()
  algorithm!: string;

  @Field(() => String)
  @IsString()
  value!: string;
}

@InputType()
export class CreateVersionFileInput {
  @Field(() => String)
  @IsString()
  fileName!: string;

  @Field(() => [CreateVersionFileHashInput], { nullable: true })
  @IsArray()
  @IsOptional()
  @Type(() => CreateVersionFileHashInput)
  @ValidateNested({ each: true })
  hashes?: CreateVersionFileHashInput[] | null;

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  primary!: boolean;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  sizeBytes!: number;

  @Field(() => String)
  @IsString()
  url!: string;
}

@InputType()
export class CreateVersionInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  changelog?: string | null;

  @Field(() => String)
  @IsIn(VERSION_CHANNELS)
  channel!: VersionChannel;

  @Field(() => [CreateVersionFileInput])
  @IsArray()
  @Type(() => CreateVersionFileInput)
  @ValidateNested({ each: true })
  files!: CreateVersionFileInput[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  gameVersions?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  loaders?: string[];

  @Field(() => String)
  @IsString()
  name!: string;

  @Field(() => String)
  @IsString()
  projectSlug!: string;

  @Field(() => String)
  @IsString()
  versionNumber!: string;
}
