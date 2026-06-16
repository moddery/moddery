import { Field, InputType } from '@nestjs/graphql';
import { type ModLoader, type ProjectSort } from '@moddery/shared';
import { IsArray, IsOptional, IsString } from 'class-validator';

@InputType()
export class CatalogQueryInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  gameVersion?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  loader?: ModLoader;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sort?: ProjectSort;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
