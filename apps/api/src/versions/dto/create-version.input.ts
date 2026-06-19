import { Field, InputType, Int } from '@nestjs/graphql';
import { VERSION_CHANNELS, type VersionChannel } from '@moddery/shared';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

@InputType()
export class CreateVersionFileHashInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  algorithm!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  value!: string;
}

@InputType()
export class CreateVersionFileInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  fileName!: string;

  @Field(() => [CreateVersionFileHashInput], { nullable: true })
  @ArrayMaxSize(8)
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
  @Min(1)
  sizeBytes!: number;

  @Field(() => String)
  @IsNotEmpty()
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
  @ArrayMaxSize(8)
  @ArrayMinSize(1)
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
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  projectSlug!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  versionNumber!: string;
}
