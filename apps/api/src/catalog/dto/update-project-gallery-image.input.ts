import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateProjectGalleryImageInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => String)
  @IsString()
  displayUrl!: string;

  @Field(() => Boolean)
  @IsBoolean()
  featured!: boolean;

  @Field(() => String)
  @IsString()
  imageId!: string;

  @Field(() => String)
  @IsString()
  rawUrl!: string;

  @Field(() => Int)
  @IsInt()
  sortOrder!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string | null;
}
