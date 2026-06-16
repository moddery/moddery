import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddProjectTeamMemberInput {
  @Field(() => [String], { nullable: true })
  permissions?: string[] | null;

  @Field(() => String)
  projectSlug!: string;

  @Field(() => String, { defaultValue: 'Member' })
  role!: string;

  @Field(() => String)
  username!: string;
}
