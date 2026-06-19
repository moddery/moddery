import { Field, InputType } from '@nestjs/graphql';
import { PROJECT_KINDS, type ProjectKind } from '@moddery/shared';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateProjectInput {
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  categories?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  color?: string | null;

  @Field(() => String)
  @IsString()
  description!: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  gameVersions?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  iconUrl?: string | null;

  @Field(() => String)
  @IsIn(PROJECT_KINDS)
  kind!: ProjectKind;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  loaders?: string[];

  @Field(() => String)
  @IsString()
  slug!: string;

  @Field(() => String)
  @IsString()
  summary!: string;

  @Field(() => String)
  @IsString()
  title!: string;
}
