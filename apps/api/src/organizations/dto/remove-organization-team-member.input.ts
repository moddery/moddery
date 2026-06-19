import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class RemoveOrganizationTeamMemberInput {
  @Field(() => String)
  @IsString()
  organizationId!: string;

  @Field(() => String)
  @IsString()
  username!: string;
}
