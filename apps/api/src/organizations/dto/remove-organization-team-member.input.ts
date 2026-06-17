import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RemoveOrganizationTeamMemberInput {
  @Field(() => String)
  organizationId!: string;

  @Field(() => String)
  username!: string;
}
