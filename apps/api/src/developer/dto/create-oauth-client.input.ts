import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateOAuthClientInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  homepageUrl?: string | null;

  @Field(() => String)
  @IsString()
  name!: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  redirectUris!: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  scopes?: string[] | null;
}
