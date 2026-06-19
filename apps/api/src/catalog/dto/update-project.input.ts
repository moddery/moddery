import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

@InputType()
export class UpdateProjectLinkInput {
  @Field(() => String)
  @IsString()
  kind!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  label?: string | null;

  @Field(() => String)
  @IsString()
  url!: string;
}

@InputType()
export class UpdateProjectInput {
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  categories?: string[] | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  color?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  discordUrl?: string | null;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  gameVersions?: string[] | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  iconUrl?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  issuesUrl?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  licenseKey?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  licenseName?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  licenseUrl?: string | null;

  @Field(() => [UpdateProjectLinkInput], { nullable: true })
  @IsArray()
  @IsOptional()
  @Type(() => UpdateProjectLinkInput)
  @ValidateNested({ each: true })
  links?: UpdateProjectLinkInput[] | null;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  loaders?: string[] | null;

  @Field(() => String)
  @IsString()
  projectSlug!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sourceUrl?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  summary?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  wikiUrl?: string | null;
}
