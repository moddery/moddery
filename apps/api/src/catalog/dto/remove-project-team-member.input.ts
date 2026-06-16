import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RemoveProjectTeamMemberInput {
  @Field(() => String)
  projectSlug!: string;

  @Field(() => String)
  username!: string;
}
