import { Field, InputType, Int } from '@nestjs/graphql';
import { type ModLoader, type ProjectSort } from '@moddery/shared';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

@InputType()
export class CatalogQueryInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Max(100)
  @Min(1)
  limit?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(0)
  offset?: number;

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
