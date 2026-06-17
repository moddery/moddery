import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddOrganizationTeamMemberInput {
  @Field(() => String)
  organizationId!: string;

  @Field(() => [String], { nullable: true })
  permissions?: string[] | null;

  @Field(() => String, { defaultValue: 'Member' })
  role!: string;

  @Field(() => String)
  username!: string;
}
