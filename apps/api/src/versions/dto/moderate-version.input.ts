import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class ModerateVersionInput {
  @Field(() => String)
  @IsString()
  action!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  reason?: string | null;

  @Field(() => String)
  @IsString()
  versionId!: string;
}
