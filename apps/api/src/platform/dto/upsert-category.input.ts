import { Field, InputType } from '@nestjs/graphql';
import { PROJECT_KINDS } from '@moddery/shared';
import { IsIn, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpsertCategoryInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => String)
  @IsString()
  name!: string;

  @Field(() => String, { nullable: true })
  @IsIn(PROJECT_KINDS)
  @IsOptional()
  projectKind?: string | null;

  @Field(() => String)
  @IsString()
  slug!: string;
}
