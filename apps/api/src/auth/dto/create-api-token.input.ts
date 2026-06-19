import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class CreateApiTokenInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(1)
  expiresInDays?: number | null;

  @Field(() => String)
  @IsString()
  name!: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  scopes?: string[] | null;
}
