import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class ModerateProjectInput {
  @Field(() => String)
  @IsString()
  action!: string;

  @Field(() => String)
  @IsString()
  projectSlug!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  reason?: string | null;
}
