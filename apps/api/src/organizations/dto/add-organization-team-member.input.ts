import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString } from 'class-validator';

@InputType()
export class AddOrganizationTeamMemberInput {
  @Field(() => String)
  @IsString()
  organizationId!: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  permissions?: string[] | null;

  @Field(() => String, { defaultValue: 'Member' })
  @IsString()
  role!: string;

  @Field(() => String)
  @IsString()
  username!: string;
}
