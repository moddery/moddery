import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateOrganizationInput {
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
  iconUrl?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string | null;

  @Field(() => String)
  @IsString()
  organizationId!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  slug?: string | null;
}
