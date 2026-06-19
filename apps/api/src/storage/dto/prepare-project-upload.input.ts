import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class PrepareProjectUploadInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  contentType?: string | null;

  @Field(() => String)
  @IsString()
  fileName!: string;

  @Field(() => String)
  @IsString()
  projectSlug!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  sizeBytes!: number;

  @Field(() => String)
  @IsString()
  uploadKind!: string;
}
