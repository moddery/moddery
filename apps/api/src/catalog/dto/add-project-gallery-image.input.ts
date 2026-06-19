import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class AddProjectGalleryImageInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => String)
  @IsString()
  displayUrl!: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  featured!: boolean;

  @Field(() => String)
  @IsString()
  projectSlug!: string;

  @Field(() => String)
  @IsString()
  rawUrl!: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  sortOrder?: number | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string | null;
}
